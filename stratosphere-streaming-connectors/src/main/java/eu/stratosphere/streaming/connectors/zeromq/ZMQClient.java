package eu.stratosphere.streaming.connectors.zeromq;

import org.zeromq.ZMQ;

public class ZMQClient {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		ZMQ.Context context = ZMQ.context(1);

        //  Socket to talk to server
        System.out.println("Connecting to hello world server…");

        ZMQ.Socket requester = context.socket(7);
        requester.connect("tcp://localhost:5555");

        for (int requestNbr = 0; requestNbr != 10; requestNbr++) {
            //String request = "Hello";
            //System.out.println("Sending Hello " + requestNbr);
            //requester.send(request.getBytes(), 0);

            byte[] reply = requester.recv();
            System.out.println("Received " + new String(reply) + " " + requestNbr);
        }
        requester.close();
        context.term();
	}

}
