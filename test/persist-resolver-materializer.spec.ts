import * as faker from 'faker'
import * as disk from 'sails-disk'
import PersistResolverMaterializer from '../lib/persist-resolver-materializer'
import { ActorMessage } from 'tarant'

class FakeActor {
  public readonly id: string
  constructor(id: string) {
    this.id = id
  }
  public toJson() {
    return { id: this.id, type: 'FakeActor' }
    //
  }
  public updateFrom() {
    //
  }
}

const dbConfig = {
  adapters: {
    disk: disk,
  },
  datastores: {
    default: {
      adapter: 'disk',
      inMemoryOnly: true,
    },
  },
}

describe('tarant db', () => {
  let persistor: PersistResolverMaterializer
  let actorModel: any

  beforeEach(async () => {
    persistor = await PersistResolverMaterializer.create(dbConfig, { FakeActor })
    actorModel = (persistor as any).actorModel
  })

  afterEach(async () => {
    await new Promise((resolve, _) => dbConfig.adapters.disk.teardown(null, resolve))
  })

  describe('onInitialize', () => {
    it('should initialize the database with the correct model', async () => {
      const id = faker.random.uuid()
      let actor = await actorModel.findOne({ id })
      expect(actor).toBeUndefined()
      const actorParam = new FakeActor(id) as any
      await persistor.onInitialize(actorParam)
      actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor' })
    })

    it('should not create if already exist', async () => {
      const id = faker.random.uuid()
      const actorParam = new FakeActor(id) as any
      await actorModel.create({ id, type: 'FakeActor' })
      await persistor.onInitialize(actorParam)
      const actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor' })
    })
  })

  describe('onAfterMessage', () => {
    it('should not create if already exist', async () => {
      const id = faker.random.uuid()
      const actorMessage = jest.fn<ActorMessage>()()
      const actorParam = new FakeActor(id) as any
      await actorModel.create({ id, type: 'FakeActor', some: faker.random.uuid() })
      await persistor.onAfterMessage(actorParam, actorMessage)
      const actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor' })
    })
  })
})
