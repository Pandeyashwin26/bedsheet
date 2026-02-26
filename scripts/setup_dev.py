#!/usr/bin/env python3
"""
AgriChain - Development Setup Script
═══════════════════════════════════════════════════════════════════════════════

Sets up the development environment for both backend and frontend.
"""

import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path


def run_command(cmd: list[str], cwd: str = None) -> bool:
    """Run a command and return success status."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True,
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False


def setup_backend():
    """Setup Python backend."""
    print("\n" + "=" * 60)
    print("🐍 Setting up Backend...")
    print("=" * 60)

    backend_dir = Path(__file__).parent.parent / "agrichain-backend"

    # Create virtual environment
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)

    # Determine pip path
    if platform.system() == "Windows":
        pip = venv_dir / "Scripts" / "pip.exe"
    else:
        pip = venv_dir / "bin" / "pip"

    # Upgrade pip
    print("Upgrading pip...")
    run_command([str(pip), "install", "--upgrade", "pip"])

    # Install requirements
    print("Installing dependencies...")
    requirements = backend_dir / "requirements.txt"
    run_command([str(pip), "install", "-r", str(requirements)])

    print("✅ Backend setup complete!")


def setup_frontend():
    """Setup React Native frontend."""
    print("\n" + "=" * 60)
    print("📱 Setting up Frontend...")
    print("=" * 60)

    frontend_dir = Path(__file__).parent.parent / "AgriChain"

    # Check for npm
    npm = shutil.which("npm")
    if not npm:
        print("❌ npm not found. Please install Node.js first.")
        return False

    # Install dependencies
    print("Installing npm dependencies...")
    run_command([npm, "install"], cwd=str(frontend_dir))

    print("✅ Frontend setup complete!")
    return True


def setup_env_files():
    """Copy environment example files."""
    print("\n" + "=" * 60)
    print("🔐 Setting up environment files...")
    print("=" * 60)

    root = Path(__file__).parent.parent

    env_files = [
        (root / ".env.example", root / ".env"),
        (root / "AgriChain" / ".env.example", root / "AgriChain" / ".env"),
    ]

    for example, target in env_files:
        if example.exists() and not target.exists():
            shutil.copy(example, target)
            print(f"✅ Created {target.name}")
        elif target.exists():
            print(f"⏭️  {target.name} already exists, skipping")
        else:
            print(f"❌ {example.name} not found")


def main():
    print("🌾 AgriChain Development Setup")
    print("=" * 60)

    setup_env_files()
    setup_backend()
    setup_frontend()

    print("\n" + "=" * 60)
    print("🎉 Setup Complete!")
    print("=" * 60)
    print("""
Next steps:
1. Edit .env file with your API keys
2. Start backend: cd agrichain-backend && python main.py
3. Start frontend: cd AgriChain && npx expo start

Happy coding! 🚀
    """)


if __name__ == "__main__":
    main()
