/*
 *    Copyright (C) 2013 Local Play
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License as
 *    published by the Free Software Foundation, either version 3 of the
 *    License, or (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

<?php    require_once( "session.php" );
    if ( !validatesession() ) {
        header( 'Location: index.html' ) ;
        exit();
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Local Play - Create</title>
        <link href="css/default.css" rel="stylesheet" />
        <script src="js/navigation.js"></script>
    </head>
    <body onload="init()">
        <div id=class="listview">
            <
        </div>
        <div class="toolbar">
            <div class="toolbarbutton" onclick="document.location='playcreate.html'">Back</div>
           <div class="toolbarbutton">Edit</div>
        </div>
    </body>
</html>