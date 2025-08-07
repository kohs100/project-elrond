import type { MergeDeep } from 'type-fest'
import { type Database as DatabaseGenerated } from './database-generated.types'
import type { Circle } from './circle.d.ts'

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        booth: {
          Row: {
            data: Circle
          }
        }
      }
    }
  }
>