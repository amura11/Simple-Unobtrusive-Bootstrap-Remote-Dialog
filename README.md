# Simple Unobtrusive Bootstrap Remote Dialog
A simple and lightweight library to unobtrusively provide Bootstrap modals with remotely loaded content. The library is built to make opening dialogs whose content is loaded from the server with minimal setup on the developers part.

The library will automatically perform a GET request for the content and load the response into the `modal-content` div. The response should be a HTML string but setting the `parser` option allows for custom parsing of the result.

##Examples

###HTML5 Data Attribute Setup
This will load the result of the get response into a modal. All events from this modal will be of the form `<event>.dialog.my-dialog`

```
<button type="button" class="btn" data-toggle="remote-dialog" data-url="example.com" data-identifier="my-dialog">
    Open Modal
</button>
```

###JavaScript Setup
```javascript
RemoteDialog.Show({
    identifier: 'my-dialog'
    url: 'example.com'
});
```

##Options

###Toggle (required)
**HTML5 Data Attribute:** `data-toggle`

**JavaScript:** N/A

The value of this option must be `remote-dialog`. This indicates that when this element is toggled it will open a remote dialog with the given options.

###Identifier (required)
**HTML5 Data Attribute:** `data-identifier`

**JavaScript:** `identifier`

The identifier option is used to uniquely identify the dialog that is currently open. The library uses one modal for all dialogs and uses the option to distinguish events. When an event is triggered this identifier is appended to the event name. Eg. `shown.dialog.my-identifier`.

###Url (required)
**HTML5 Data Attribute:** `data-url`

**JavaScript:** `url`

The URL option is the address to send the Ajax get request to.

###Parser (optional)
**HTML5 Data Attribute:** N/A

**JavaScript:** `parser`

A function to call to parse the response to a successful Ajax request. This is useful if the response isn't just an HTML string.

##Events
All events that are triggered by the library will be of the form `<event>.dialog.<identifier>`. This allows for event handlers to bind to the same events for different identifiers, ie. performing one action when a certain dialog is shown and a different one when another is shown.

###Shown
**Full Event Name:** `shown.dialog.<identifier>`

**Triggered:** After the content has been loaded and the modal is made visible

**Parameters:** None

###Hidden
**Full Event Name:** `hidden.dialog.<identifier>`

**Triggered:** After the modal has been closed and all animations have completed

**Parameters:** None

###Error
**Full Event Name:** `error.dialog.<identifier>`

**Triggered:** When the Ajax requests results in an error.

**Parameters:** jqXHR jqXHR, PlainObject ajaxSettings, String thrownError

###Button Click
**Full Event Name:** `<target_id>.dialog.<identifier>`

**Triggered:** Any time a `button` element that is a child of the dialog is clicked. When triggered the element that triggered the event has it's id pre-pended to the event. This allows for buttons with the same id to be handled separately for different dialogs.

**Parameters:** None
