import * as actions from "../actions/BufferActions";

let initialState = {
  currentBufferName: null,
  buffers: {
    "#theonechannel": {
      name: "#theonechannel",
      topic: "A topic for the one channel",
      lines: [
        { time: "09:41", nick: "bashorg", message: "http://bash.org/?244321" },
        {
          time: "09:41",
          nick: "Cthon98",
          message: "hey, if you type in your pw, it will show as stars"
        },
        { time: "09:41", nick: "Cthon98", message: "********* see!" },
        { time: "09:41", nick: "AzureDiamond", message: "hunter2" },
        {
          time: "09:41",
          nick: "AzureDiamond",
          message: "doesnt look like stars to me"
        },
        { time: "09:41", nick: "Cthon98", message: "<AzureDiamond> *******" },
        { time: "09:41", nick: "Cthon98", message: "thats what I see" },
        { time: "09:41", nick: "AzureDiamond", message: "oh, really?" },
        { time: "09:41", nick: "Cthon98", message: "Absolutely" },
        {
          time: "09:41",
          nick: "AzureDiamond",
          message: "you can go hunter2 my hunter2-ing hunter2"
        },
        {
          time: "09:41",
          nick: "AzureDiamond",
          message: "haha, does that look funny to you?"
        },
        {
          time: "09:41",
          nick: "Cthon98",
          message:
            "lol, yes. See, when YOU type hunter2, it shows to us as *******"
        },
        {
          time: "09:41",
          nick: "AzureDiamond",
          message: "thats neat, I didnt know IRC did that"
        },
        {
          time: "09:41",
          nick: "Cthon98",
          message:
            "yep, no matter how many times you type hunter2, it will show to us as *******"
        },
        { time: "09:41", nick: "AzureDiamond", message: "awesome!" },
        {
          time: "09:41",
          nick: "AzureDiamond",
          message: "wait, how do you know my pw?"
        },
        {
          time: "09:41",
          nick: "Cthon98",
          message:
            "er, I just copy pasted YOUR ******'s and it appears to YOU as hunter2 cause its your pw"
        },
        { time: "09:41", nick: "AzureDiamond", message: "oh, ok." }
      ]
    },
    "#robe&wizard": {
      name: "#robe&wizard",
      topic: "bash.org",
      lines: [
        { time: "09:41", nick: "bashorg", message: "http://bash.org/?104383" },
        {
          time: "09:41",
          nick: "bloodninja",
          message: "Baby, I been havin a tough night so treat me nice aight?"
        },
        { time: "09:41", nick: "BritneySpears14", message: "Aight." },
        {
          time: "09:41",
          nick: "bloodninja",
          message: "Slip out of those pants baby, yeah."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "I slip out of my pants, just for you, bloodninja."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message: "Oh yeah, aight. Aight, I put on my robe and wizard hat."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "Oh, I like to play dress up."
        },
        { time: "09:41", nick: "bloodninja", message: "Me too baby." },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "I kiss you softly on your chest."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "I cast Lvl. 3 Eroticism. You turn into a real beautiful woman."
        },
        { time: "09:41", nick: "BritneySpears14", message: "Hey..." },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "I meditate to regain my mana, before casting Lvl. 8 chicken of the Infinite."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "Funny I still don't see it."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "I spend my mana reserves to cast Mighty F*ck of the Beyondness."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "You are the worst cyber partner ever. This is ridiculous."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "Don't f*ck with me bitch, I'm the mightiest sorcerer of the lands."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "I steal yo soul and cast Lightning Lvl. 1,000,000 Your body explodes into a fine bloody mist, because you are only a Lvl. 2 Druid."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "Don't ever message me again you piece of ****."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "Robots are trying to drill my brain but my lightning shield inflicts DOA attack, leaving the robots as flaming piles of metal."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message:
            "King Arthur congratulates me for destroying Dr. Robotnik's evil army of Robot Socialist Republics. The cold war ends. Reagan steals my accomplishments and makes like it was cause of him."
        },
        {
          time: "09:41",
          nick: "bloodninja",
          message: "You still there baby? I think it's getting hard now."
        },
        { time: "09:41", nick: "bloodninja", message: "Baby?" },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "Ok, are you ready?"
        },
        {
          time: "09:41",
          nick: "eminemBNJA",
          message: "Aight, yeah I'm ready."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "I like your music Em... Tee hee."
        },
        {
          time: "09:41",
          nick: "eminemBNJA",
          message: "huh huh, yeah, I make it for the ladies."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "Mmm, we like it a lot. Let me show you."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message:
            "I take off your pants, slowly, and massage your muscular physique."
        },
        {
          time: "09:41",
          nick: "eminemBNJA",
          message: "Oh I like that Baby. I put on my robe and wizard hat."
        },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message: "What the f*ck, I told you not to message me again."
        },
        { time: "09:41", nick: "eminemBNJA", message: "Oh ****" },
        {
          time: "09:41",
          nick: "BritneySpears14",
          message:
            "I swear if you do it one more time I'm gonna report your ISP and say you were sending me kiddie porn you f*ck up."
        },
        { time: "09:41", nick: "eminemBNJA", message: "Oh ****" },
        {
          time: "09:41",
          nick: "eminemBNJA",
          message: "damn I gotta write down your names or something"
        }
      ]
    }
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actions.CHANGE_CURRENT_BUFFER:
      return {
        ...state,
        currentBufferName: action.bufferName
      };
    default:
      return state;
  }
};
