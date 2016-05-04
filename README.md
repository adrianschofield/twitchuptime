#Twitch-Uptime

Display Twitch stream uptime in OBS or Xsplit

Download all the files, there is a zip available here: http://unshapedadrian.co.uk/downloads/twitchuptime.zip and store them in a folder on your hard drive.

Edit the file uptime.js in the scripts directory and change the channel name to reflect your channel name.
By default the tool will display your uptime like this:

Uptime: 01:00:05

If you want to change either the text or whether hours, minutes, seconds are displayed then edit the line that looks like this:

var myOutputFormat = 'Uptime: hh:mm';

For example to display "I've been streaming for:" and then display hours minutes and seconds use the following:

var myOutputFormat = 'I've been streaming for: hh:mm:ss';


Please Note that when the Browser page is active in OBS it will poll Twitch to work out if the stream is live, to prevent this just hide the source in OBS.
To use in OBS Studio:

Add a Source and choose BrowserSource
Give the source a name and then configure it as follows:

Local file: checked
Local File: browse to the uptime.html in the folder you created above.
Width: depends on the font you choose
Height: 50 unless you change the fontsize in the css file

To use in OBS Classic:

Add a source and choose CLR Browser, if you don't see that option you need the correct plugin installed.
Give the source a name and then configure it as follows:

URL: Press the ? button and browse to the uptime.html in the folder you created above.
Width: depends on the font you choose
Height: 50 unless you change the fontsize in the css file

To use in Xsplit:

Select Add Source from the menu and choose Media File
Browse to the uptime.html in the folder you created above.
Change the layout by right clicking on the source choose the Layout Tab
Width: depends on the font you choose
Height: 50 unless you change the fontsize in the css file

