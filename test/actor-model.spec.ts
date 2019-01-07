import model from '../lib/actor-model.json'

describe('actor-model', () => {
    it('should have expected fields', () => {
        expect(model).toEqual(
            {
                "attributes": {
                    "id": { "type": "string", "required": true },
                    "type": { "type": "string", "required": true }
                },
                "datastore": "default",
                "identity": "actor",
                "primaryKey": "id",
                "schema": false
            }
        )
    })
})