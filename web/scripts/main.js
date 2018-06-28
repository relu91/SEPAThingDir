

$(document).ready(function() {
    let ws = new WebSocket('ws://localhost:3001');
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

