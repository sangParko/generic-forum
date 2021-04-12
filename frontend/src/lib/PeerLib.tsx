import hark from 'hark';
import Peer from 'peerjs';


const constraints = {audio: true, video: false};

export default class PeerLib {
    private peer: Peer;
    private callStartedCB: (() => void);
    private callEndedCB: (() => void);
    private callStream: MediaStream | undefined;
    private callPeerConnection: Peer.MediaConnection | undefined;
    private readonly audioElement: HTMLMediaElement;
    private readonly getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;

    constructor(audioElement: HTMLMediaElement,
                getUserMedia: (constraints?: MediaStreamConstraints) => Promise<MediaStream>,
                peerServerConnectedCB: (id: string) => void,
                peerServerDisconnectedCB: () => void,
                callStartedCB: () => void,
                callEndedCB: () => void,
    ) {
        let that = this;
        this.audioElement = audioElement
        this.getUserMedia = getUserMedia;
        this.peer = new Peer();
        this.callStartedCB = callStartedCB;
        this.callEndedCB = callEndedCB;
        this.peer.on('open', function (id) {
            peerServerConnectedCB(id);
        });
        this.peer.on('close', function () {
            peerServerDisconnectedCB();
            that.peer.reconnect();
        });
        this.answerCall();
    }

    public endCall = () => {
        let that = this;
        this.callEndedCB();
        this.callPeerConnection && this.callPeerConnection.close();
        this.callStream && this.callStream.getTracks().forEach(function(track) {
            console.log("track stopped")
            track.stop();
        });
        this.audioElement.srcObject = null
        this.audioElement.onloadedmetadata = function (e) {
            that.audioElement.pause()
        };
    }

    public setUpCall = (call: Peer.MediaConnection) => {
        let that = this
        call.on('stream', function (remoteStream: MediaStream) {
            console.log(remoteStream);
            that.callStream = remoteStream;
            that.callPeerConnection = call;
            that.callStartedCB();
            that.audioElement.srcObject = remoteStream;
            that.audioElement.onloadedmetadata = function (e) {
                that.audioElement.play().then(r => {
                });
            };
            const options = {};
            const speechEvents = hark(remoteStream, options);
            speechEvents.on('volume_change', (volume) => {
                // console.log(volume);
            });
        });
        call.on('close', () => {
            that.endCall();
        });
    }

    public callPeer = (peerID: string) => {
        let that = this;
        let peer = this.peer;
        this.getUserMedia(constraints).then(function (mediaStream: MediaStream) {
            const call = peer.call(peerID, mediaStream);
            that.setUpCall(call)
        }).catch(function (err) {
            console.log(err.name + ': ' + err.message);
        });
    };

    public answerCall = () => {
        let that = this;
        let getUserMedia = this.getUserMedia;
        this.peer.on('call', function (call) {
            getUserMedia(constraints).then(function (mediaStream: MediaStream) {
                call.answer(mediaStream);
                that.setUpCall(call)
            }).catch(function (err) {
                console.log(err.name + ': ' + err.message);
            });
        });
    };

}