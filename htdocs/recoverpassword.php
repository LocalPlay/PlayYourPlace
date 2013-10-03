<?php 
	if ($_POST) {
	try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // validate user
            //
            $email = $_POST[ 'email' ];
            $result = $db->getCreatorWithEmail( $email );
            //
            //
            //
            if ( $result && mysql_numrows($result) > 0 ) {
                $creatorid = mysql_result( $result, 0, "id" );
                $password = generatePassword();
                //
                //
                //
                sendreminder( $email, $password );               
                //
                // store new password
                //
                $encrypted = md5($password);
                $db->executeCommand( "UPDATE creator SET password='$encrypted' WHERE id='$creatorid';");
                //
                //
                //
                echo '{ "status" : "OK", "message" : "A reminder has been sent to ' . $email . '" }';
            } else {
                echo '{ "status" : "FAILED", "message" : "Invalid email" }';
            }
        } catch( Exception $e ) {
            echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
    } else {
  	    echo '{ "status" : "FAILED", "message" : "Invalid method" }';
    }
    function generatePassword($length=9) {
        $vowels = 'aeuyAEUY';
        $consonants = 'bdghjmnpqrstvzBDGHJLMNPQRSTVWXZ23456789@#$%'; 
        $password = '';
        $alt = time() % 2;
        for ($i = 0; $i < $length; $i++) {
            if ($alt == 1) {
                $password .= $consonants[(rand() % strlen($consonants))];
                $alt = 0;
            } else {
                $password .= $vowels[(rand() % strlen($vowels))];
                $alt = 1;
            }
        }
        return $password;
    }
    function sendreminder( $email, $password ) {
            $name = "Playsouthend"; //senders name 
            $sender = "admin@playsouthend.co.uk"; //senders e-mail adress 
            $message = "Your new Playsouthend password is : $password\nGo to http://playsouthend.co.uk and edit your profile to change it to something more memorable."; //mail body 
            $subject = "Playsouthend login"; //subject 
            $header = "From: ". $name . " <" . $sender . ">\r\n"; //optional headerfields 
            try {
                mail($email, $subject, $message, $header, "-f$sender");
            } catch( Exception $e ) {

            }
    }


?>