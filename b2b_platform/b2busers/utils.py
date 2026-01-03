import uuid
import hashlib
from django.utils import timezone
from datetime import timedelta

def addMinutesToNow(minutes):
    return timezone.now() + timedelta(minutes=minutes)
def hash_string_sha256(input_string):
  """
  Generates the SHA256 hash for a given string.

  Args:
    input_string: The string to hash.

  Returns:
    The SHA256 hash as a hexadecimal string.
  """
  # Encode the string into bytes (e.g., using UTF-8)
  encoded_string = input_string.encode('utf-8')

  # Create a new SHA256 hash object
  hash_object = hashlib.sha256(encoded_string)

  # Get the hexadecimal representation of the hash
  hex_digest = hash_object.hexdigest()

  return hex_digest


def newtoken():
    newUUID = str( uuid.uuid4())
    return hash_string_sha256(newUUID)
    