import hashlib

# Foydalanuvchidan matn olish
matn = input("Hash qilish uchun matnni kiriting: ")

# SHA-256 algoritmi yordamida matnni hash qilish
hash_obekti = hashlib.sha256(matn.encode())
hash_nazari = hash_obekti.hexdigest()

# Hash natijasini chiqarish
print("Hash natijasi (SHA-256):", hash_nazari)
