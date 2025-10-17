$(document).ready(function () {
    $('#footer').load('../views/footer.html', function () {
        const aktuellesJahr = new Date().getFullYear();
        $('#jahr').text(aktuellesJahr);
    });
});

