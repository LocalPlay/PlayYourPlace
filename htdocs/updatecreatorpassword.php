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
        echo '{ "status" : "FAILED", "message" : "Please login to update your profile." }';
        exit();
    }
	if ($_SERVER['REQUEST_METHOD']==='POST') {
	try {
			//
			// connect to database
			//
			require_once( "db.php" );
			$db = new DBConnection;
			$db->connect();
			//
			// update score
			//
			$creatorid	= $_REQUEST[ 'creatorid' ];
            if ( $creatorid !== $_SESSION[ 'creatorid' ] ) {
                throw new Exception( "You do not have permission to update this profile!" );
            }
			$oldpassword	= $_POST[ 'oldpassword' ];
			$newpassword	= $_POST[ 'newpassword' ];
            //
            //
            //
            $db->updateaccountpassword(  $creatorid, $oldpassword, $newpassword ) ;
			echo '{ "status" : "OK", "message" : "Password updated" }';
		} catch( Exception $e ) {
			echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
		}
	} else {
		echo '{ "status" : "FAILED", "message" : "Invalid method" }';
	}

?>
