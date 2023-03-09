// @Entity('user')
// export class UserEntity {  
//     @PrimaryGeneratedColumn('uuid') id: string;  
//     @Column({ 
//         type: 'varchar', 
//         nullable: false, 
//         unique: true 
//     }) 
//     username: string;
//     @Column({ 
//         type: 'varchar', 
//         nullable: false 
//     }) 
//     password: string;  @Column({ 
//         type: 'varchar', 
//         nullable: false 
//     }) 
    
//     email: string;
//     @BeforeInsert()  async hashPassword() {
//         this.password = await bcrypt.hash(this.password, 10);  
//     }
// }
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument } from 'mongoose';

// export type UserDocument = HydratedDocument<User>;

// @Schema()
// export class User {
//     @Prop({ required: true })
//     email: string
  
// //     @Prop()
// //   username: { type: String, required: false }

//   @Prop({ required: true })
//   password: string


// }

// export const UserSchema = SchemaFactory.createForClass(User);

// import * as mongoose from 'mongoose';

// export const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true},
//   password: { type: String, required: true}
// });

// export interface User {
//   email : string;
//   password : string;
//   _id: string;
// }

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);