import type { BootcDistributionItem } from '@/store/api/backend';

export type KnownImage = Omit<BootcDistributionItem, 'arch'>;

export const OFFICIAL_REGISTRY = 'registry.redhat.io';

export const KNOWN_IMAGES: KnownImage[] = [
  {
    reference: 'registry.redhat.io/rhel10/rhel-bootc-kvm:latest',
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'guest-image',
  },
  {
    reference: 'registry.redhat.io/rhel10/rhel-bootc-aws:latest',
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'aws',
  },
  {
    reference: 'registry.redhat.io/rhel10/rhel-bootc-installer:latest',
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'bootable-container-iso',
    // Assuming that the installer targets bare-metal deployments,
    // so let's use the base image as the payload so there's no
    // cloud/VM specific configuration.
    iso_payload_references: ['registry.redhat.io/rhel10/rhel-bootc:latest'],
  },
];

export const isKnownImageRef = (ref: string) => {
  return KNOWN_IMAGES.some((known) => known.reference === ref);
};

// Development builds (make cockpit/devel DEV_REGISTRY=...) can redirect
// registry operations to a registry holding unpublished containers.
// References shown in the UI and stored in blueprints keep the official
// registry; only podman and image-builder CLI invocations are rewritten.
const getDevRegistry = (): string | undefined =>
  process.env.DEV_REGISTRY?.replace(/\/+$/, '') || undefined;

// The image names are identical on both registries; only the
// repository path differs.
export const resolveImageReference = (reference: string): string => {
  const devRegistry = getDevRegistry();
  if (!devRegistry || !isKnownImageRef(reference)) {
    return reference;
  }
  return `${devRegistry}/${reference.split('/').pop()}`;
};

export const getRegistryHost = (): string => {
  const devRegistry = getDevRegistry();
  return devRegistry ? devRegistry.split('/')[0] : OFFICIAL_REGISTRY;
};

// For the auth verification: the official registry hosts the known
// images under rhel10/, the development registry is itself the
// repository path.
export const getRegistrySearchPath = (): string => {
  return getDevRegistry() ?? `${OFFICIAL_REGISTRY}/rhel10`;
};
