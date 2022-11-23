const { Scenes, session, Telegraf, Markup } = require('telegraf');
require('dotenv').config()
const bot = new Telegraf(process.env.BOT_TOKEN);

const { enter, leave } = Scenes.Stage;

const register = new Scenes.BaseScene("register");

register.enter(async ctx => {
    try {
        await ctx.replyWithHTML('‼️ <b>Enter only existing data or you will not be accepted for mock tests</b>')
        setTimeout(async () => {
            await ctx.reply('📂 Enter your first and last name:')
        }, 500)
    }catch(e) {
        console.error(e);
    }
})

register.on("text", async ctx => {
    try {
        await collection.insertOne({user_id: ctx.message.from.id, name: ctx.message.text})
        await ctx.scene.enter('clas_1')
    }catch(e) {
        console.error(e);
    }
})

const clas_1 = new Scenes.BaseScene("clas_1");


clas_1.enter(async ctx => {
    try {
        await ctx.reply('📂 Enter your class:')
    }catch(e) {
        console.error(e);
    }
})

clas_1.on("text", async ctx => {
    try {
        let bd = await collection.findOneAndUpdate({user_id: ctx.message.from.id}, {$set: {class: ctx.message.text}})
        let user = await collection.findOne({user_id: ctx.message.from.id})
        await collection.findOneAndUpdate({_id: ObjectId('637cad61f831ac056f15f04c')}, {$push: {forms: {user_id: user.user_id, class: user.class, name: user.name, user_name: ctx.message.from.username || 'None'}}})        
        await ctx.scene.enter('leaves')
    }catch(e) {
        console.error(e);
    }
})

// const student_id = new Scenes.BaseScene("student_id");


// student_id.enter(async ctx => {
//     try {
//         await ctx.reply('📂 Enter your ID:')
//     }catch(e) {
//         console.error(e);
//     }
// })

// student_id.on("text", async ctx => {
//     try {
//         let text = await ctx.message.text;
//         const hasOnlyDigits = (v) => /^\d+$/.test(v);
//         let isnum = await !hasOnlyDigits(text);  
//         if (isnum == false) {
//             let bd = await collection.findOneAndUpdate({user_id: ctx.message.from.id}, {$set: {student_id: ctx.message.text}})
            
//         }else {
//             await ctx.reply('🔢 Please enter numbers, I do not accept letters or symbols!')
//             await ctx.scene.enter('student_id')
//         }
//     }catch(e) {
//         console.error(e);
//     }
// })

const leaves = new Scenes.BaseScene("leaves");

leaves.enter(async ctx => {
    try {
        await ctx.reply('✅ You have successfully registered')
        await ctx.scene.leave('leaves')
    }catch(e) {
        console.error(e);
    }
})

const stage = new Scenes.Stage([register, clas_1, leaves]);
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB;
const client = new MongoClient(url);
client.connect();
const db = client.db('bot');
const collection = db.collection('forms');
const { DateTime } = require('luxon');

bot.start((ctx) => ctx.reply(`Welcome!\nTo start registration, enter the command /register`));
bot.help((ctx) => ctx.reply('To start registration, enter the command /register\nFor help, write to the examiner - @salva1ore'));
bot.launch({dropPendingUpdates: true});
bot.use(session());
bot.use(stage.middleware());

bot.command('register', async ctx => {
    try {
        let date = await DateTime.now().setZone('Asia/Tashkent').setLocale('uz-UZ');
        if (date.c.month == 11) {
            if (date.c.day < 25) {
                let checkreq = await collection.findOne({user_id: ctx.message.from.id})
                if (checkreq == null) {
                    let colvo = await collection.findOne({_id: ObjectId('637cad61f831ac056f15f04c')})
                    let lghs = colvo.forms.length;
                    if (lghs <= 60) {
                        await ctx.scene.enter('register') 
                    }else {
                        await ctx.reply('⚠️ Limit of 60 students')
                    }
                }else {
                    await ctx.reply('⚠️ You are already registered')
                }  
            }else if (date.c.day == 25) {
                if (date.c.hour < 22) {
                    let checkreq = await collection.findOne({user_id: ctx.message.from.id})
                    if (checkreq == null) {
                        let colvo = await collection.findOne({_id: ObjectId('637cad61f831ac056f15f04c')})
                        let lghs = colvo.forms.length;
                        if (lghs <= 60) {
                            await ctx.scene.enter('register') 
                        }else {
                            await ctx.reply('⚠️ Limit of 60 students')
                        }
                    }else {
                        await ctx.reply('⚠️ You are already registered')
                    }                
                }else {
                    await ctx.reply('Registration has already ended ⚠️') 
                }
            }else {
                return
            }                 
        }else {
            await ctx.reply('⚠️ There are no plans to conduct mock tests this month')
        }    
    }catch(e) {
        console.error(e);
    }
})

bot.command('get', async ctx => {
    try {
        if (ctx.message.from.id == 1869597237 || 5103314362) {
            let dball = await collection.findOne({_id: ObjectId('637cad61f831ac056f15f04c')})
            for (let i = 0; i < dball.forms.length; i++) {
                await ctx.replyWithHTML(`🗂 Request №${i + 1}\n\n<b>Last name and first name</b>: ${dball.forms[i].name}\n<b>Class</b>: ${dball.forms[i].class}\n<b>UserName on Telegram</b>: @${dball.forms[i].user_name}`)
            }
        }else {
            await ctx.reply('⚠️ You dont have enough rights')
        }
    }catch(e) {
        console.error(e);
    }
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));