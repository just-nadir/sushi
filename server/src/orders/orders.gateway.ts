import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all for dev
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  emitNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }

  emitOrderStatusUpdate(order: any) {
    console.log("🚀 GATEWAY EMITTING orderStatusChanged:", order.id, order.status);
    this.server.emit('orderStatusChanged', order);
  }
}
