$(document).ready(function () {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const $email = $('#email').val().trim();
        const $password = $('#password').val().trim();
        if($email && $password) {
            alert('Login erfolgreich: ' + $email);
        } else {
            alert('Bitte alle Felder ausfüllen.');
        }
    });
});


function login(email, password) {
    $.ajax({
        type: "POST",
        url:"https"
    })




};






$(function() {
      $('#footer').load('../views/footer.html');
    });


