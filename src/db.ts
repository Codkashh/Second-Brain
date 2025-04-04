import mongoose, {model, Schema} from 'mongoose';
mongoose.connect("mongodb://localhost:27017/Second-Brain")

const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [{type:mongoose.Types.ObjectId, ref:'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref: 'User', require: true}
})

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema ({
    // 'hash' is a string that represents the shortened or hashed version of a link

    hash: String,
    // 'userId' is a reference to the 'User' collection in the database.
    // It uses Mongoose's ObjectId type for relational data.
    // The 'ref' property specifies the referenced collection name ('User').
    // The 'required' property ensures this field must be provided when creating a document.
    // The 'unique' property enforces that each 'userId' in this collection is unique.

    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
});

export const LinkModel = model("Link", LinkSchema);
