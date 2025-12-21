-- Kiểm tra role hiện tại của tài khoản
SELECT id, email, name, role FROM "User" WHERE email = 'thanhtu02102003@gmail.com';

-- Nếu role không phải 'ADMIN', chạy lệnh này để update:
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'thanhtu02102003@gmail.com';

-- Kiểm tra lại
SELECT id, email, name, role FROM "User" WHERE email = 'thanhtu02102003@gmail.com';
