<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated'
    ]);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['user_id']) || !isset($data['first_name']) || !isset($data['last_name']) || !isset($data['email'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

// Verify user can only update their own profile
if ($data['user_id'] != $_SESSION['user_id']) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

$userId = $data['user_id'];
$firstName = trim($data['first_name']);
$middleName = trim($data['middle_name'] ?? '');
$lastName = trim($data['last_name']);
$email = trim($data['email']);
$address = trim($data['address'] ?? '');
$profilePicture = $data['profile_picture'] ?? null;  // ← GET PROFILE PICTURE!

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit;
}

try {
    // Check if email is already taken by another user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email AND id != :user_id");
    $stmt->execute([
        'email' => $email,
        'user_id' => $userId
    ]);
    
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Email is already taken by another user'
        ]);
        exit;
    }
    
    // Check if profile picture should be updated
    $updateProfilePicture = false;
    if ($profilePicture && strpos($profilePicture, 'data:image') === 0) {
        $updateProfilePicture = true;
    }
    
    // Check if password change is requested
    if (isset($data['current_password']) && isset($data['new_password'])) {
        // Verify current password
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = :user_id");
        $stmt->execute(['user_id' => $userId]);
        $currentUser = $stmt->fetch();
        
        if (!password_verify($data['current_password'], $currentUser['password'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Current password is incorrect'
            ]);
            exit;
        }
        
        // Validate new password length
        if (strlen($data['new_password']) < 6) {
            echo json_encode([
                'success' => false,
                'message' => 'New password must be at least 6 characters'
            ]);
            exit;
        }
        
        // Update profile with new password
        $newPasswordHash = password_hash($data['new_password'], PASSWORD_DEFAULT);
        
        if ($updateProfilePicture) {
            // Update WITH password AND profile picture
            $stmt = $conn->prepare("
                UPDATE users 
                SET first_name = :first_name,
                    middle_name = :middle_name,
                    last_name = :last_name,
                    email = :email,
                    address = :address,
                    password = :password,
                    profile_picture = :profile_picture,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
            ");
            
            $stmt->execute([
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'password' => $newPasswordHash,
                'profile_picture' => $profilePicture,
                'user_id' => $userId
            ]);
        } else {
            // Update WITH password ONLY (keep existing profile picture)
            $stmt = $conn->prepare("
                UPDATE users 
                SET first_name = :first_name,
                    middle_name = :middle_name,
                    last_name = :last_name,
                    email = :email,
                    address = :address,
                    password = :password,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
            ");
            
            $stmt->execute([
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'password' => $newPasswordHash,
                'user_id' => $userId
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile and password updated successfully!'
        ]);
    } else {
        // Update profile without password change
        if ($updateProfilePicture) {
            // Update WITH profile picture
            $stmt = $conn->prepare("
                UPDATE users 
                SET first_name = :first_name,
                    middle_name = :middle_name,
                    last_name = :last_name,
                    email = :email,
                    address = :address,
                    profile_picture = :profile_picture,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
            ");
            
            $stmt->execute([
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'profile_picture' => $profilePicture,  // ← SAVES PROFILE PICTURE!
                'user_id' => $userId
            ]);
        } else {
            // Update WITHOUT profile picture (keep existing)
            $stmt = $conn->prepare("
                UPDATE users 
                SET first_name = :first_name,
                    middle_name = :middle_name,
                    last_name = :last_name,
                    email = :email,
                    address = :address,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
            ");
            
            $stmt->execute([
                'first_name' => $firstName,
                'middle_name' => $middleName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'user_id' => $userId
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully!'
        ]);
    }
    
    // Update session data
    $_SESSION['first_name'] = $firstName;
    $_SESSION['middle_name'] = $middleName;
    $_SESSION['last_name'] = $lastName;
    $_SESSION['full_name'] = $firstName . ' ' . $lastName;
    $_SESSION['email'] = $email;
    
} catch(PDOException $e) {
    error_log("Profile update error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update profile. Please try again.'
    ]);
}
?>