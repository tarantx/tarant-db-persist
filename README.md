# ![tarant-db](https://user-images.githubusercontent.com/3071208/228353122-6010aa3a-8bf2-43ed-9399-99d04d1fcd06.png)


![Downloads](https://img.shields.io/npm/dt/tarant-db-persist.svg)
[![npm](https://img.shields.io/npm/v/tarant-db-persist.svg)](https://www.npmjs.com/package/tarant-db-persist)
![npm](https://img.shields.io/npm/l/tarant-db-persist.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/tarantx/tarant-db-persist/build.yml?branch=main)
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
[![Maintainability](https://api.codeclimate.com/v1/badges/4cdaae6d6f61ee0999ab/maintainability)](https://codeclimate.com/github/tarantx/tarant-db-persist/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4cdaae6d6f61ee0999ab/test_coverage)](https://codeclimate.com/github/tarantx/tarant-db-persist/test_coverage)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![issues Welcome](https://img.shields.io/badge/issues-welcome-brightgreen.svg)
![GitHub issues](https://img.shields.io/github/issues/tarantx/tarant-db-persist.svg)
![GitHub pull requests](https://img.shields.io/github/issues-pr/tarantx/tarant-db-persist.svg)



## Motivation

Provide the capabilities to actors on the backend to be persisted using waterline adapters.

## Installation

add it to your project using `npm install tarant-db-persist --save` or `yarn add tarant-db-persist`

## Usage

Initialize the sync client with the waterline adapter from the persist storage you will be interested on

```js
import { ActorSystem, ActorSystemConfigurationBuilder } from 'tarant';
import * as diskAdapter from 'sails-disk';
import { PersistResolverMaterializer } from 'tarant-db-persist';
import AppActor from '../AppActor';

const config = {
    adapter: {
        type: diskAdapter,
        settings: {
          inMemoryOnly: true
        },
      },
      actorTypes: { AppActor }
  };

const persister = await PersistMaterializer.create(config)

const system : any = ActorSystem.for(ActorSystemConfigurationBuilder.define()
    .withMaterializers([persister])
    .withResolvers([persister])
    .done())  

```

your actors will require to implement IUpdatable (UpdateFrom) and IExportable (toJson)

```js
import { Actor } from "tarant";
import { IUpdatable, IExportable } from "tarant-db-persist"

export default class AppActor extends Actor implements IUpdatable, IExportable {

  constructor(name: string) {
      super(name)
  }

  addOne() {
      this.counter++
  }

  toJson(){
        return {
            id: this.id,
            type:"AppActor",
            counter: this.counter
        }
    }

    updateFrom({ counter }: any): void {
        this.counter = counter
    }

    private counter = 1; 
}

```

##### Created my free [logo](https://logomakr.com/8lSyYS) at <a href="http://logomakr.com" title="Logo Makr">LogoMakr.com</a> 

