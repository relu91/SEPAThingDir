

$(document).ready(function() {
    let wsURL = new URL(window.location.href);
    wsURL.port = 3001;
    wsURL.protocol = 'ws';
    let ws = new WebSocket(wsURL);
    ws.onopen = () => {
        ws.send('{}');
    };

    ws.onmessage = (message) => {
        let noti = JSON.parse(message.data);
        if ( noti.added ) {
            
            const template = `<div class="thingDesc">
                <object class="thingIcon" type="image/svg+xml" data="web/icon.svg">
                    |_|
                </object>
                <p>Thing ${noti.added['@id']}</p>
            </div>`;
            $(template).attr('id', noti.added['@id']).appendTo('#thinglist');
        }

        if (noti.removed) {
            $('#' + noti.removed).remove();
        }
    };
});

