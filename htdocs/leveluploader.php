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

<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() ) {
        header( 'Location: index.html' ) ;
        exit();
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <form action="putlevel.php" method="post">
            <input type="hidden" name="id" value="0" />
            Name: <input type="text" name="name" /><br />
            Thumbnail: <input type="text" name="thumbnail" /><br />
            JSON:<br /><textarea name="data" rows="40" cols="25"></textarea>
            <input type="submit" value="Upload" />
        </form>
    </body>
</html>