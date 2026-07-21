-- Distinct from ArtistProfile's existing profile/banner images — a real,
-- separate slot for magazine/article layout imagery (Rule 13's article
-- hub), which often needs different composition than a profile photo.
ALTER TABLE "ArtistProfile" ADD COLUMN "articleHeroImageUrl" TEXT;
