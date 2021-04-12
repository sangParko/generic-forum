package socket

import (
	"bytes"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Message struct {
	Function string
	Data     interface{}
}

type WebSocketService struct {
	routes  map[string]interface{}
}

func NewWebSocketRouter() WebSocketService {
	routes := make(map[string]interface{})
	return WebSocketService{routes: routes}
}

func (s *WebSocketService) RegisterRoute(route string, api interface{}) {
	s.routes[route] = api
}

func (s *WebSocketService) InvokeFunction(conn *websocket.Conn, route string, data interface{}) {
	if s.routes[route] == nil {
		log.Println("unrecognized function")
		return
	}

	s.routes[route].(func(conn *websocket.Conn, data interface{}))(conn, data)
}

func (s *WebSocketService) reader(conn *websocket.Conn) {
	for {
		// read in a Message
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("[ERROR] Reading - " + err.Error())
			return
		}
		decoder := json.NewDecoder(bytes.NewReader(p))
		var msg Message
		err = decoder.Decode(&msg)
		if err != nil {
			log.Println("[ERROR] Decoding - " + err.Error())
		}

		s.InvokeFunction(conn, msg.Function, msg.Data)
	}
}

func (s *WebSocketService) WebSocketEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// upgrade this connection to a WebSocket
	// connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected")
	retMsg := Message{
		Function: "uuid-created",
		Data:     uuid.New().String(),
	}
	retData, err := json.Marshal(retMsg)
	err = ws.WriteMessage(1, retData)
	if err != nil {
		log.Println(err)
	}
	// listen indefinitely for new messages coming
	// through on our WebSocket connection
	go s.reader(ws)
}

func WriteMessage(conn *websocket.Conn, message Message) {
	retData, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, retData); err != nil {
		log.Println(err)
		return
	}
}