DELIMITER $$

CREATE PROCEDURE register_user(
    IN p_username VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(15),
    IN p_streetAddress VARCHAR(255),
    IN p_city VARCHAR(100),
    IN p_state VARCHAR(100),
    IN p_postalCode VARCHAR(20)
)
BEGIN
    DECLARE user_count INT;
    
    -- Check if the username already exists
    SELECT COUNT(*) INTO user_count
    FROM users
    WHERE username = p_username;

    IF user_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username already exists';
    ELSE
        -- Insert new user into the users table
        INSERT INTO users (
            username, 
            password, 
            email, 
            phone_number, 
            street_address, 
            city, 
            state, 
            postal_code
        )
        VALUES (
            p_username, 
            p_password, 
            p_email, 
            p_phone, 
            p_streetAddress, 
            p_city, 
            p_state, 
            p_postalCode
        );
    END IF;
END$$

DELIMITER ;




DELIMITER $$

CREATE PROCEDURE authenticate_user(
    IN p_username VARCHAR(255),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT;
    
    -- Check if the user exists with the provided username and password
    SELECT COUNT(*) INTO user_exists
    FROM users
    WHERE username = p_username AND password = p_password;

    IF user_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username or password';
    ELSE
        SELECT user_id, username FROM users WHERE username = p_username;
    END IF;
END$$

DELIMITER ;





