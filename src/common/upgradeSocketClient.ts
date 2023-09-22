import { randomUUID } from 'crypto';
import net from 'net';

export interface UpgradedSocketClient extends net.Socket {
  writeWithAck: (data: unknown) => Promise<any>;
}

const MESSAGE_TIMEOUT = 10000;

export function upgradeSocketClient(socket: net.Socket): UpgradedSocketClient {
  socket.on('data', (data) => {
    data
      .toString()
      .split('\n')
      .filter((m) => !!m)
      .forEach((message) => {
        socket.emit('message', JSON.parse(message));
      });
  });

  // @ts-ignore
  socket.writeWithAck = (data) => {
    return new Promise((resolve, reject) => {
      data.id = randomUUID();
      socket.write(JSON.stringify(data));

      const timeoutId = setTimeout(() => {
        reject();
      }, MESSAGE_TIMEOUT);

      const listener = (responseData) => {
        if (responseData.id === data.id) {
          socket.removeListener('message', listener);
          clearTimeout(timeoutId);
          resolve(responseData);
        }
      };

      socket.on('message', listener);
    });
  };

  return socket as UpgradedSocketClient;
}
