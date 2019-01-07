import * as faker from 'faker'
import * as disk from 'sails-disk'
import PersistResolverMaterializer from "../lib/persist-resolver-materializer"
import { Actor, ActorMessage } from 'tarant';

class FakeActor {

    public readonly id: string
    constructor(id: string) {
        this.id = id
      }
    public toJson() {
        //
    }
    public updateFrom() {
        //
    }
  }

  
const dbConfig = {
    adapters: {
      'disk': disk
    },
    datastores: {
        default: {
          adapter: 'disk',
          inMemoryOnly: true
        }
    }
  }

describe('tarant db', () => {
    let persistor : PersistResolverMaterializer
    beforeEach(async () => {
        persistor = await PersistResolverMaterializer.create(dbConfig, { FakeActor })        
    })

    describe('create', () => {
        it('should initialize the database with the correct model', async () => {
            const actor = new FakeActor("") as any
            persistor.onInitialize(actor)
        })
    })
})