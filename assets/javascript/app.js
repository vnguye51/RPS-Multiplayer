var database = firebase.database();

var wins = 0;
var losses = 0;
var ties = 0;

var player = 0
var playerObj = {
    playerOne: 0,
    playerTwo: 0
}

var choicesObj = {
    playerOne: '',
    playerTwo: ''
}

var choice = ''
var username = ''

// $(window).on('unload',(function(){
//     if (player == 1){
//         playerObj.playerOne = 0
//         choicesObj.playerOne = ''
//     }
//     else if (player == 2){
//         playerObj.playerTwo = 0
//         choicesObj.playerTwo = ''
//     }

// }))

$('.choosePlayer').on('click',function(event){
    $('#P1').attr('hidden',true)

    if(playerObj.playerOne == 0){
        player = 1
        playerObj.playerOne = 1
        username =  $('#username').val() + '(Player1)'
        $('#playerDisplay').html('You are PLAYER ONE')
    }
    else if(playerObj.playerTwo == 0){
        player = 2
        playerObj.playerTwo = 1 
        username =  $('#username').val() + '(Player2)'
        $('#playerDisplay').html('You are PLAYER TWO')
    }
    else{
        username =  $('#username').val() + '(spectator)'
    }//No more room for players
    
    $('.choosePlayer').attr('hidden',true)
    if(player != 0){
        $('#choiceBox').removeAttr('hidden')
    }
    $('#username').attr('hidden',true)
    database.ref('users').set(playerObj)

})

$('.RPS').on('click',function(){
    choice = $(this).attr('data')
    if (player == 1){
        choicesObj.playerOne = choice
    }
    else if (player == 2){
        choicesObj.playerTwo = choice
    }
    $('#YourChoice').html('YOU CHOSE ' + choice).removeAttr('hidden')
    $('.RPS').attr('hidden',true)
    database.ref('choices').set(choicesObj)
    
   
})

database.ref('chat').on('child_added',function(snapshot){
    $('#chat').append(snapshot.val().msg)
    $('#chat').append('<br>')
})


database.ref('choices').on('value',function(snapshot){
    choicesObj = snapshot.val()
    if (choicesObj.playerOne != '' && choicesObj.playerTwo != ''){
        checkVictor(choicesObj.playerOne,choicesObj.playerTwo)
        choicesObj.playerOne = ''
        choicesObj.playerTwo = ''
        $('#YourChoice').attr('hidden',true)
        database.ref('choices').set(choicesObj)
        if(player != 0){
            console.log('a')
            $('.RPS').removeAttr('hidden')
        }
    }

    
    if (player == 1){
        database.ref('choices').onDisconnect().set({
            playerOne: '',
            playerTwo: playerChoices.playerTwo,
        })
    }
    else if (player == 2){
        database.ref('choices').onDisconnect().set({
            playerOne: playerChoices.playerOne,
            playerTwo: '',
        })
    }
})

database.ref('users').on('value', function(snapshot){
    playerObj = snapshot.val()
    if (player == 1){
        database.ref('users').onDisconnect().set({
            playerOne: 0,
            playerTwo: playerObj.playerTwo,
        })
    }
    else if (player == 2){
        database.ref('users').onDisconnect().set({
            playerOne: playerObj.playerOne,
            playerTwo: 0,
        })
    }
})


$('#inputButton').on('click',function(){
    database.ref('chat').push({
        msg: username + ': ' + $('#textBox').val()
    })
    // $('#chat').append($('#textBox').val())
    // $('#chat').append('<br>')
})


function checkVictor(choice1,choice2){
    if ((choice1 === "r") && (choice2 === "s")) {
        win()
    } else if ((choice1 === "r") && (choice2 === "p" || choice2 == '')) {
        lose()
    } else if ((choice1 === "s") && (choice2 === "r" || choice2 == '')) {
        lose()
    } else if ((choice1 === "s") && (choice2 === "p" || choice2 == '')) {
        win()
    } else if ((choice1 === "p") && (choice2 === "r" || choice2 == '')) {
        win()
    } else if ((choice1 === "p") && (choice2 === "s" || choice2 == '')) {
        lose()
    } else if (choice1 === choice2) {
        tie()
    }
}

function win(){
    $('#victor').removeAttr('hidden')
    $('#victor').html('PLAYER ONE WINS')
}

function lose(){
    $('#victor').removeAttr('hidden')
    $('#victor').html('PLAYER TWO WINS')
}

function tie(){
    $('#victor').removeAttr('hidden')
    $('#victor').html('TIE')
}


