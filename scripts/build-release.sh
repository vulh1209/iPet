#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from tauri.conf.json
VERSION=$(grep '"version"' src-tauri/tauri.conf.json | head -1 | cut -d'"' -f4)

# Detect current architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    TARGET="aarch64-apple-darwin"
    ARCH_NAME="Apple Silicon (arm64)"
else
    TARGET="x86_64-apple-darwin"
    ARCH_NAME="Intel (x86_64)"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Building iPet v${VERSION}${NC}"
echo -e "${GREEN}  Target: ${ARCH_NAME}${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
npm ci

# Build for current architecture (no cross-compilation needed)
echo ""
echo -e "${YELLOW}Building for ${ARCH_NAME}...${NC}"
echo ""

npm run tauri build -- --target "$TARGET"

# Output locations
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Output files:"
echo -e "  ${YELLOW}App:${NC} src-tauri/target/${TARGET}/release/bundle/macos/iPet.app"
echo -e "  ${YELLOW}DMG:${NC} src-tauri/target/${TARGET}/release/bundle/dmg/iPet_${VERSION}_${ARCH}.dmg"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Test the app: open src-tauri/target/${TARGET}/release/bundle/macos/iPet.app"
echo "  2. GitHub Actions will build for both architectures automatically"
echo ""
