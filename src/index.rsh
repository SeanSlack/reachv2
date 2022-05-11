'reach 0.1'

const Message = Struct([
    ['from', Address],
    ['message', Bytes(20)],
    ['to', Address]
])

export const main  = Reach.App(() => {

    setOptions({
        // TODO: before go live, verify this
        // verifyArithmetic: true,
        untrustworthyMaps: true,
        connectors: [ALGO]
      });

    const Admin = Participant('Admin', {
    ready: Fun([], Null)
    });


    const MessengerApi = API('MessengerApi', {
    sendMessage: Fun([Message], Bool),
    receiveMessage: Fun([], Message),
    optIn: Fun([], Bool)
    })

    const Publisher = Events('Publisher', {
        messageSent: [Message]
      });

    init();
    Admin.publish();

    Admin.only(() => {
        interact.ready();
    });

    // map of key address and message type

  const MessageMap = new Map(Message)

  const [shouldContinue] = parallelReduce([true]).define(() => {
    }).paySpec([]).invariant(balance() == 0)
    .while(shouldContinue)
    .api(MessengerApi.sendMessage, (message, apiReturn) =>{
        MessageMap[this] = message;
        Publisher.messageSent(message);
        MessageMap[message.to] = message
        apiReturn(true);
        return [true]
    }).api(MessengerApi.receiveMessage, (apiReturn) => {
        const message = fromSome(MessageMap[this], Message.fromObject({ from: this,
                            to: this,
                            message:'12345678901234567890'}));
        apiReturn(message);
        return [true]
    })
    .api(MessengerApi.optIn, (apiReturn) => {
        MessageMap[this] =  Message.fromObject({ from: this,
            to: this,
            message:'12345678901234567890'});
        apiReturn(true);
        return [true];
    });
    commit();
    exit();
});