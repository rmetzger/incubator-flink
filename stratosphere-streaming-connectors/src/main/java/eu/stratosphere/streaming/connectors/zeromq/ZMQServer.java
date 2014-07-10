package eu.stratosphere.streaming.connectors.zeromq;

import org.zeromq.ZMQ;

public class ZMQServer {

	public static void main(String[] args) throws InterruptedException {
		// TODO Auto-generated method stub
		ZMQ.Context context = ZMQ.context(1);

        //  Socket to talk to clients
        ZMQ.Socket responder = context.socket(8);
        responder.bind("tcp://*:5555");

        while (!Thread.currentThread().isInterrupted()) {
            // Wait for next request from the client
            //byte[] request = responder.recv(0);
            //System.out.println("Received Hello");

            // Do some 'work'
            Thread.sleep(1000);

            // Send reply back to client
            String reply = "World";
            responder.send(reply.getBytes(), 0);
        }
        responder.close();
        context.term();
	}

}
