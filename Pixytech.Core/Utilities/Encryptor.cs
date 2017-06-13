using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Pixytech.Core.Utilities
{
    public static class Encryptor
    {
        private static readonly byte[] SaltBytes = { 20, 214, 30, 42, 53, 67, 79, 84 };

        public static string Encrypt(string toBeEncrypted, string password)
        {
            if (string.IsNullOrWhiteSpace(toBeEncrypted) || string.IsNullOrWhiteSpace(password))
            {
                return string.Empty;
            }

            byte[] encryptedBytes;
            var bytesToBeEncrypted = Encoding.UTF8.GetBytes(toBeEncrypted);

            using (var ms = new MemoryStream())
            {
                using (var aes = new RijndaelManaged())
                {
                    aes.KeySize = 256;
                    aes.BlockSize = 128;

                    var key = new Rfc2898DeriveBytes(password, SaltBytes, 1000);
                    aes.Key = key.GetBytes(aes.KeySize / 8);
                    aes.IV = key.GetBytes(aes.BlockSize / 8);

                    aes.Mode = CipherMode.CBC;

                    using (var cs = new CryptoStream(ms, aes.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(bytesToBeEncrypted, 0, bytesToBeEncrypted.Length);
                        cs.Close();
                    }
                    encryptedBytes = ms.ToArray();
                }
            }

            return Convert.ToBase64String(encryptedBytes);
        }

        public static string Decrypt(string toBeDecrypted, string password)
        {
            if (string.IsNullOrWhiteSpace(toBeDecrypted) || string.IsNullOrWhiteSpace(password))
            {
                return string.Empty;
            }

            byte[] decryptedBytes = null;
            var bytesToBeDecrypted = Convert.FromBase64String(toBeDecrypted);

            using (var ms = new MemoryStream())
            {
                using (var aes = new RijndaelManaged())
                {
                    aes.KeySize = 256;
                    aes.BlockSize = 128;

                    var key = new Rfc2898DeriveBytes(password, SaltBytes, 1000);
                    aes.Key = key.GetBytes(aes.KeySize / 8);
                    aes.IV = key.GetBytes(aes.BlockSize / 8);

                    aes.Mode = CipherMode.CBC;

                    using (var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(bytesToBeDecrypted, 0, bytesToBeDecrypted.Length);
                        cs.Close();
                    }
                    decryptedBytes = ms.ToArray();
                }
            }

            return Encoding.UTF8.GetString(decryptedBytes);
        }
    }
}