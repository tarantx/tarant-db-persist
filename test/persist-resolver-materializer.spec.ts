import { faker } from '@faker-js/faker'
import * as disk from 'sails-disk'
import PersistResolverMaterializer from '../lib/persist-resolver-materializer'
import { ActorMessage } from 'tarant'

class FakeActor {
  public readonly id: string
  public some: string | undefined
  constructor(id: string) {
    this.id = id
  }
  public toJson() {
    return { id: this.id, type: 'FakeActor', some: this.some }
  }

  public updateFrom() {
    //
  }
}

describe('tarant db', () => {
  let persistor: PersistResolverMaterializer
  let actorModel: any

  beforeEach(async () => {
    var config = {
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
    persistor = await PersistResolverMaterializer.create(config, { FakeActor })
    actorModel = (persistor as any).actorModel
  })

  afterEach(async () => {
    await new Promise((resolve, _) => disk.teardown(null, resolve))
  })

  describe('onInitialize', () => {
    it('should initialize the database with the correct model', async () => {
      const id = faker.datatype.uuid()
      let actor = await actorModel.findOne({ id })
      expect(actor).toBeUndefined()
      const actorParam = new FakeActor(id) as any
      await persistor.onInitialize(actorParam)
      actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor' })
    })

    it('should not create if already exist', async () => {
      const id = faker.datatype.uuid()
      const actorParam = new FakeActor(id) as any
      await actorModel.create({ id, type: 'FakeActor' })
      await persistor.onInitialize(actorParam)
      const actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor' })
    })
  })

  describe('onAfterMessage', () => {
    it('should not create and update if already exist setting undefined as null', async () => {
      const id = faker.datatype.uuid()
      const actorMessage = jest.fn<ActorMessage, []>()()
      const actorParam = new FakeActor(id) as any
      actorParam.some = faker.datatype.uuid()
      await actorModel.create({ id, type: 'FakeActor', some: faker.datatype.uuid() })
      await persistor.onAfterMessage(actorParam, actorMessage)
      const actor = await actorModel.findOne({ id })
      expect(actor).toEqual({ id, type: 'FakeActor', some: actorParam.some })
    })
  })

  describe('resolveActorById', () => {
    it('retrieve actor if exists in db', async () => {
      const id = faker.datatype.uuid()
      await actorModel.create({ id, type: 'FakeActor', some: id })
      const actor = await persistor.resolveActorById(id)
      expect(actor).toBeInstanceOf(FakeActor)
      expect((actor as any).toJson()).toEqual({ id, type: 'FakeActor' })
    })

    it('should fail if not db', async () => {
      const id = faker.datatype.uuid()
      try {
        await persistor.resolveActorById(id)
        fail()
      } catch (error) {
        expect(error).toEqual('Actor not found')
      }
    })
  })
})
