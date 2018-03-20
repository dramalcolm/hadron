import { ConnectionOptions, createConnections, getRepository } from 'typeorm';

class ConnectionOption {
  public name: string;
  public type: string;
  public host: string;
  public port: number;
  public username: string;
  public password: string;
  public database: string;
  public synchronize: boolean;
  public logging: boolean = false;
  public autoSchemaSync: boolean = true;
  public entities: string[] = ['../../src/entity/**/*.ts'];
  public migrations: string[] = ['../../src/migration/**/*.ts'];
  public subscribers: string[] = ['../../src/subscriber/**/*.ts'];
}

const createDatabaseConnection = (connectionName: string, databaseType: string, hostAdress: string, hostPort: number,
                                  username: string, userPassword: string, databaseNama: string): ConnectionOption => {
  const newConnection = new ConnectionOption();
  newConnection.name = connectionName;
  newConnection.type = databaseType;
  newConnection.host = hostAdress;
  newConnection.port = hostPort;
  newConnection.username = username;
  newConnection.password = userPassword;
  newConnection.database = databaseNama;

  return newConnection;
};

const createConnection = (container: any, config: any) => {
  const {
    connections: connectionArray = [],
    entities: entityArray = [],
    log = false,
  } = config;

  createConnections(connectionArray)
  .then(async connections => {
    const repositories: any = [];
    connections.map(async connection => {
      if (log) {
        console.log(` - hadron-typeorm: ${ connection.name } connected`);
      }

      repositories[connection.name] = entityArray.reduce((obj: any, entity: any) => ({
        ...obj,
        [entity.name]: connection.getRepository(entity),
      }), {});

      if (log) {
        console.log(`   hadron-typeorm: registered ` +
          `${Object.keys(repositories[connection.name]).length} repositories`);
      }
    });
    // Register repositories inside container
    container.register('repositories', repositories);
    // Register connections inside container
    container.register('connections', connections);
  });
}

export { createConnection, createDatabaseConnection, ConnectionOption };
