var database = firebase.database();

var wins = 0;
var losses = 0;
// var ties = 0;

var player = 0
var playerObj = {
    playerOne: 0,
    playerTwo: 0
}

var choicesObj = {
    playerOne: '',
    playerTwo: ''
}

var imagesObj ={
    playerOne: '',
    playerTwo: '',
}

var choice = ''

var username = ''

var namesObj = {
    playerOne: '(Player1)',
    playerTwo: '(Player2)'
}

var scoreObj = {
    playerOne: 0,
    playerTwo: 0,
}

var input = $("#textBox"); //Add "enter" functionality to input fields
input.on("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        $('#inputButton').trigger('click')
    }
});

var input = $("#username"); //Add "enter" functionality to input fields
input.on("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        $('#P1').trigger('click')
    }
});


//Send a new chat line to firebase
$('#inputButton').on('click',function(){
    database.ref('chat').push({
        msg: username + ': ' + $('#textBox').val()
    })
    $('#textBox').val("")
})


//When a player joins the game assign them to player one, player two, or spectator
$('.choosePlayer').on('click',function(event){
    $('#P1').attr('hidden',true)

    if(playerObj.playerOne == 0){
        player = 1
        playerObj.playerOne = 1
        username =  $('#username').val() + '(Player1)'
        namesObj.playerOne = username
        $('#playerDisplay').attr('hidden',true)
    }
    else if(playerObj.playerTwo == 0){
        player = 2
        playerObj.playerTwo = 1 
        username =  $('#username').val() + '(Player2)'
        namesObj.playerTwo = username
        $('#playerDisplay').attr('hidden',true)
    }
    else{
        username =  $('#username').val() + '(spectator)'
    }

    $('.choosePlayer').attr('hidden',true)
    if(player != 0){
        $('#choiceBox').removeAttr('hidden')
    }
    $('#username').val("")
    $('#joinbox').attr('hidden',true)
    database.ref('users').set(playerObj)
    database.ref('names').set(namesObj)

})

//Upload the player's choice to firebase and show them an image based on their choice
$('.RPS').on('click',function(){
    choice = $(this).attr('data')
    if (player == 1){
        choicesObj.playerOne = choice
    }
    else if (player == 2){
        choicesObj.playerTwo = choice
    }
    grabGiphy(choice,player)
    // $('#YourChoice').html('YOU CHOSE ' + choice).removeAttr('hidden')
    $('.RPS').attr('hidden',true)
    database.ref('choices').set(choicesObj)
})

//Update the player's  score
database.ref('score').on('value',function(snapshot){
    scoreObj = snapshot.val()
    $('#P1Score').html('WINS: ' + scoreObj.playerOne)
    $('#P2Score').html('WINS: ' + scoreObj.playerTwo)

    //If a player disconnects reset their data on firebase
    if (player == 1){
        database.ref('score').onDisconnect().set({
            playerOne: 0,
            playerTwo: scoreObj.playerTwo,
        })
    }
    else{
        database.ref('score').onDisconnect().set({
            playerOne: scoreObj.playerOne,
            playerTwo: 0,
        })
    }
})

//Store a player's name
database.ref('names').on('value',function(snapshot){
    namesObj = snapshot.val()
    $('#P1Name').html(namesObj.playerOne)
    $('#P2Name').html(namesObj.playerTwo)

    //If a player disconnects reset their data on firebase
    if (player == 1){
        database.ref('names').onDisconnect().set({
            playerOne: '(Player1)',
            playerTwo: namesObj.playerTwo,
        })
    }
    else{
        database.ref('names').onDisconnect().set({
            playerOne: namesObj.playerOne,
            playerTwo: '(Player2)',
        })
    }
})

//Store the randomly generated giphy image urls
database.ref('images').on('value',function(snapshot){
    imagesObj = snapshot.val()
    $('#P1Image').attr('src',imagesObj.playerOne)
    $('#P2Image').attr('src',imagesObj.playerTwo)

    if (player == 1){
        database.ref('images').onDisconnect().set({
            playerOne: '',
            playerTwo: imagesObj.playerTwo,
        })
    }
    else if (player == 2){
        database.ref('images').onDisconnect().set({
            playerOne: imagesObj.playerOne,
            playerTwo: '',
        })
    }
})

//Store the chat info I should probably have it only display the most recent~50 or images. 
//Currently, it displays every message since the firebase was created
database.ref('chat').on('child_added',function(snapshot){
    var scrolled = $('#chat').prop('scrollTop')
    var scrollHeight = $('#chat').prop('scrollHeight') - $('#chat').prop('offsetHeight')

   if (scrolled >= scrollHeight){
    $('#chat').append(snapshot.val().msg)
    $('#chat').append('<br>')
    $('#chat').scrollTop($('#chat').prop('scrollHeight') - $('#chat').prop('offsetHeight')+10)
   }
   else{
    $('#chat').append(snapshot.val().msg)
    $('#chat').append('<br>')
}


})

//Store a players choice. 
database.ref('choices').on('value',function(snapshot){
    choicesObj = snapshot.val()
    if (player==1 && choicesObj.playerOne!=''){
        $('#P1Image').removeAttr('hidden')
        $('#P1Name').html(namesObj.playerOne + ': ' + choicesObj.playerOne.toUpperCase())

    }
    if (player==2 && choicesObj.playerTwo!=''){
        $('#P2Image').removeAttr('hidden')
        $('#P2Name').html(namesObj.playerTwo + ': ' + choicesObj.playerTwo.toUpperCase())

    }

    //If both players have made a choice then determine the victor of the game and reset their values
    if (choicesObj.playerOne != '' && choicesObj.playerTwo != ''){
        $('#P2Name').html(namesObj.playerTwo + ': ' + choicesObj.playerTwo.toUpperCase())
        $('#P1Name').html(namesObj.playerOne + ': ' + choicesObj.playerOne.toUpperCase())
        var victor = checkVictor(choicesObj.playerOne,choicesObj.playerTwo)
        if (victor == 0){
            $('#victor').html('TIE GAME')
        }
        else if (player == 0){
            if (victor == 1){
                $('#victor').html(namesObj.playerOne + ' WINS')
            }
            else{
                $('#victor').html(namesObj.playerTwo + ' WINS')
            }
        }
        else if (victor == player){
            $('#victor').html('YOU WIN')
        }
        else{
            $('#victor').html('YOU LOSE')
        }
        if (victor == 1){
            scoreObj.playerOne++
        }
        else if (victor == 2){
            scoreObj.playerTwo++
        }

        database.ref('score').set(scoreObj)

        $('#victor').removeAttr('hidden')
        $('#P2Image').removeAttr('hidden')
        $('#P1Image').removeAttr('hidden')

        //Might be some desync issues here. If errors occur check here first.
        setTimeout(function(){
            choicesObj.playerOne = ''
            choicesObj.playerTwo = ''
            imagesObj.playerOne = ''
            imagesObj.playerTwo = ''
            database.ref('choices').set(choicesObj)
            database.ref('images').set(imagesObj)
            $('#P2Image').attr('hidden',true)
            $('#P1Image').attr('hidden',true)
            $('#victor').attr('hidden',true)
            
            if(player != 0){
                $('.RPS').removeAttr('hidden')
            }
        },5000)
    }

    
    if (player == 1){
        database.ref('choices').onDisconnect().set({
            playerOne: '',
            playerTwo: choicesObj.playerTwo,
        })
    }
    else if (player == 2){
        database.ref('choices').onDisconnect().set({
            playerOne: choicesObj.playerOne,
            playerTwo: '',
        })
    }
})

//Store which players have joined the match
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





function checkVictor(choice1,choice2){
    if ((choice1 === "rock") && (choice2 === "scissors")) {
        return 1
    } else if ((choice1 === "rock") && (choice2 === "paper" || choice2 == '')) {
        return 2
    } else if ((choice1 === "scissors") && (choice2 === "rock" || choice2 == '')) {
        return 2
    } else if ((choice1 === "scissors") && (choice2 === "paper" || choice2 == '')) {
        return 1
    } else if ((choice1 === "paper") && (choice2 === "rock" || choice2 == '')) {
        return 1
    } else if ((choice1 === "paper") && (choice2 === "scissors" || choice2 == '')) {
        return 2
    } else if (choice1 === choice2) {
        return 0
    }
}



function grabGiphy(s,player){

    if(s == 'rock'){
        s = 'boulder'
    }

    var queryURL = "https://api.giphy.com/v1/gifs/random?tag=" +
      s + "&api_key=dc6zaTOxFJmzC";
    $.ajax({
        url: queryURL,
        method: "GET"
      })
        .then(function(response) {
          var image = response.data.image_url;
          if (player == 1){
              imagesObj.playerOne = image
          }
          else{
              imagesObj.playerTwo = image
          }
          database.ref('images').set(imagesObj)
    })
}