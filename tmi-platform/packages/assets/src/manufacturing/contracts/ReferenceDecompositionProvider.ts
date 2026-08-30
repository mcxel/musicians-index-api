// ReferenceDecompositionProvider contract – model agnostic
export interface StyleDNA {
  // Arbitrary data representing stylistic DNA (e.g., color palette, patterns)
  [key: string]: any;
}

export interface DecompositionEvidence {
  // Records of evidence supporting the decomposition (e.g., model version, confidence scores)
  providerName: string;
  timestamp: string;
  details?: any;
}

export interface ReferenceDecompositionProvider {
  /**
   * Decompose a reference image (or a set of images) into one or more AssetRequirement objects.
   *
   * @param imagePath Absolute path to the reference image.
   * @param collectionId Identifier for the collection this image belongs to.
   * @param prior? Optional prior decomposition metadata to assist incremental processing.
   */
  decompose(
    imagePath: string,
    collectionId: string,
    prior?: DecompositionEvidence
  ): Promise<AssetRequirement[]>;
}

// The AssetRequirement type is defined in the manufacturing contracts package.
import { AssetRequirement } from "./AssetRequirement";
