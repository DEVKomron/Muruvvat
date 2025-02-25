import { Column, DataType, Model, Table } from "sequelize-typescript";

interface ISaxiyCreationAttr {
  user_id: number | undefined;
  name: string | undefined;
  phone_number: string | undefined;
  last_state: string;
}

@Table({ tableName: "saxiy" })
export class Saxiy extends Model<Saxiy, ISaxiyCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
  user_id: number | undefined;

  @Column({
    type: DataType.STRING,
  })
  name: string | undefined;

  @Column({
    type: DataType.STRING,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  location: string;

  @Column({
    type: DataType.STRING,
  })
  last_state: string;
}
