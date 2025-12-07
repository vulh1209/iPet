#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get version from tauri.conf.json
VERSION=$(grep '"version"' src-tauri/tauri.conf.json | head -1 | cut -d'"' -f4)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Building iPet v${VERSION}${NC}"
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

# Build universal binary (Intel + Apple Silicon)
echo ""
echo -e "${YELLOW}Building universal binary for macOS...${NC}"
echo "This will create a binary that runs on both Intel and Apple Silicon Macs."
echo ""

npm run tauri build -- --target universal-apple-darwin

# Output locations
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Output files:"
echo -e "  ${YELLOW}App:${NC} src-tauri/target/universal-apple-darwin/release/bundle/macos/iPet.app"
echo -e "  ${YELLOW}DMG:${NC} src-tauri/target/universal-apple-darwin/release/bundle/dmg/iPet_${VERSION}_universal.dmg"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Test the app: open src-tauri/target/universal-apple-darwin/release/bundle/macos/iPet.app"
echo "  2. Create a GitHub release with the DMG file"
echo ""
