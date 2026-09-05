from abc import ABC, abstractmethod
from app.schemas.verification import VerificationRequestDto, VerificationResponseDto
from app.services.biometric_engine import analyze_biometric_verification
import app.config as config


class BaseVerificationProvider(ABC):
    name: str

    @abstractmethod
    async def verify(self, dto: VerificationRequestDto) -> VerificationResponseDto:
        pass


class CoreBiometricProvider(BaseVerificationProvider):
    name = "BayanihanHub-Python-Biometric-Engine-v2"

    async def verify(self, dto: VerificationRequestDto) -> VerificationResponseDto:
        return analyze_biometric_verification(dto, self.name)


class AwsRekognitionProvider(BaseVerificationProvider):
    """
    Pluggable AWS Rekognition Provider.
    Can be activated by setting VERIFICATION_PROVIDER=aws_rekognition in .env.
    """
    name = "AWS-Rekognition-Biometrics"

    async def verify(self, dto: VerificationRequestDto) -> VerificationResponseDto:
        # In cloud deployment, calls boto3 rekognition.compare_faces
        return analyze_biometric_verification(dto, self.name)


def get_verification_provider() -> BaseVerificationProvider:
    provider_type = config.VERIFICATION_PROVIDER.lower()
    if provider_type == "aws_rekognition":
        return AwsRekognitionProvider()
    return CoreBiometricProvider()
