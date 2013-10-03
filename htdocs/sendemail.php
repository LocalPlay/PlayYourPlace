<?php
	//
	// validate session
	//
    require_once( "session.php" );
    if ( !validatesession() || $_SESSION['creatorrole'] < 1 ) {
        echo '{ "status" : "FAILED", "message" : "You do not have permission to send email!" }';
        exit();
    }
    //
    //
    //
      if ($_POST) {
        try {
            //
            // connect to database
            //
            require_once( "db.php" );
            $db = new DBConnection;
            $db->connect();
            //
            // get data 
            //
            $subject	= $_POST[ 'subject' ];
            $email	    = $_POST[ 'email' ];
            $message    = $_POST[ 'message' ];
            //
            // send mail
            //
            $name = "Playsouthend"; 
            $sender = "admin@playsouthend.co.uk"; 
            //
            // 
            //
            $header  = "From: $name <$sender>\r\n"; 
            $header .= "Reply-To: $sender\r\n"; 
            $header .= "Return-path: $sender\r\n" .
            mail($email, $subject, $message, $header, "-f$sender");
            //
            //
            //
            echo '{ "status" : "OK", "message" : "Message sent" }';
        } catch( Exception $e ) {
          echo '{ "status" : "FAILED", "message" : "' . $e->getMessage() . '" }';
        }
      } else {
        echo '{ "status" : "FAILED", "message" : "Invalid method" }';
      }
?>
