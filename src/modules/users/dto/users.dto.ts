export class UdpateUsersDto {
  name: string;
  bio: string;
  profession: string;
}

export class PresignedUrlDto {
  contentType: string;
  fileSize: number;
}

export class UpdateAvatarKeyDto {
  key: string;
}
