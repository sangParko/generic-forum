package domains

import (
	"../common/socket"
	"github.com/gorilla/websocket"
	"log"
)

type PeerControllerImpl struct {
	peerIDs []string
}

func NewAuthController() *PeerControllerImpl {
	return &PeerControllerImpl{
	}
}

func (c *PeerControllerImpl) ConnectPeers(conn *websocket.Conn, data interface{}) {
	log.Println("received request")
	peerID := data.(string)
	if len(c.peerIDs) == 0 {
		c.peerIDs = append(c.peerIDs, peerID)
		socket.WriteMessage(conn, socket.Message{Function: "ok", Data: "requested"})
		return
	}
	for _, pID := range c.peerIDs {
		if peerID == pID {
			socket.WriteMessage(conn, socket.Message{Function: "message", Data: "already requested"})
			return
		}
	}
	socket.WriteMessage(conn, socket.Message{Function: "connect-proceed", Data: c.peerIDs[0]})
	c.peerIDs = []string{}
}
