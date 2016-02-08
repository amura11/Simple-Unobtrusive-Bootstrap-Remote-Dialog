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

##Toggle Button Options

###Toggle (required)
**HTML5 Data Attribute:** `data-toggle`

**JavaScript:** N/A

The value of this option must be `remote-dialog`. This indicates that when this element is toggled it will open a remote dialog with the given options.

###Identifier (required)
**HTML5 Data Attribute:** `data-identifier`

**JavaScript:** `identifier`

The identifier option is used to uniquely identify the dialog that is currently open. The library uses one modal for all dialogs and uses the option to distinguish events. When an event is triggered this identifier is put into the `id` attribute of the `.modal-content` div

###Url (required)
**HTML5 Data Attribute:** `data-url`

**JavaScript:** `url`

The URL option is the address to send the Ajax get request to.

##Modal Button Options

###Confirm
**HTML5 Data Attribute:** `data-confirm`

When a confirm message is present and this is set to true a confirm message is shown when this button is clicked. This option is implied to be true when `data-confirm-message` is present and can be left out.

###Confirm Message
**HTML5 Data Attribute:** `data-confirm-message`

When set a confirm message with the value of this attribute is shown when the owning button is clicked.

###Confirmation Accept Text
**HTML5 Data Attribute:** `data-confirm-accept-text`

The text to display in the accept button when the confirmation message is displayed

###Confirmation Cancel Text
**HTML5 Data Attribute:** `data-confirm-cancel-text`

The text to display in the cancel button when the confirmation message is displayed

###Submit
**HTML5 Data Attribute:** `data-submit`

When set to true and `data-submit-url` is set any form data in the dialog is submitted to the given URL. The `RemoteDialog.handlers.submit` function is used by default when submitting the data. This option is implied to be true when `data-submit-url` is present and can be left out.

###Submit URL
**HTML5 Data Attribute:** `data-submit-url`

When set to a URL and `data-submit` is not set or true, any form data in the dialog is submitted to the given URL. The `RemoteDialog.handlers.submit` function is used by default when submitting the data.

###Reaload
**HTML5 Data Attribute:** `data-reload`

When set to true and `data-reload-url` is set the modal content is reloaded from the given URL. The `RemoteDialog.handlers.load` function is used by default when reload the modal. This option is implied to be true when `data-reload-url` is present and can be left out.

###Reaload URL
**HTML5 Data Attribute:** `data-reload-url`

When set to a URL and `data-reload` is not set or true, the modal content is reloaded from the given URL. The `RemoteDialog.handlers.load` function is used by default when reload the modal.

##Events
All events that are triggered by the library will be of the form `<event>.dialog` and will be triggered by the `.modal-content` div.

###Shown
**Full Event Name:** `shown.dialog`

**Triggered:** After the content has been loaded and the modal is made visible

**Parameters:** None

###Hidden
**Full Event Name:** `hidden.dialog`

**Triggered:** After the modal has been closed and all animations have completed

**Parameters:** None

###Loaded
**Full Event Name:** `loaded.dialog`

**Triggered:** When the Ajax requests is successful

**Parameters:** None

###Load Error
**Full Event Name:** `load-error.dialog`

**Triggered:** When the Ajax requests results in an error.

**Parameters:** jqXHR jqXHR, PlainObject ajaxSettings, String thrownError

//TODO: Complete Event List

##Handlers

The library uses a set of handlers for loading the content and submitting any form data. These are stored in a publicly accessible variable called `RemoteDialog.handlers`. These handlers are made public so that they can be overridden to use custom logic if needed. Below is a basic description of each handler and any requirements needed for each.

//TODO: Complete handlers list

##Templates

The library automatically adds elements to the page and to the modal. This content is stored inside of template variables that can be overridden with custom content if needed. Below is a description of each template and the basic requirements of each.

//TODO: Complete template list
