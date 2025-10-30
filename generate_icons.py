#!/usr/bin/env python3
"""
Simple script to generate icon files for the Chrome extension.
Requires: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL (Pillow) not installed. Installing...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'Pillow'])
    from PIL import Image, ImageDraw, ImageFont

import os

def draw_star_polygon(draw, center_x, center_y, outer_radius, inner_radius, fill, outline, width):
    """Draw a 5-pointed star"""
    import math
    points = []
    for i in range(10):
        radius = outer_radius if i % 2 == 0 else inner_radius
        angle = (i * math.pi / 5) - math.pi / 2
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        points.append((x, y))
    
    draw.polygon(points, fill=fill, outline=outline, width=width)

def create_icon(size, filename):
    """Create a single icon file"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), color='#1976D2')
    draw = ImageDraw.Draw(img)
    
    # Draw star
    center = size // 2
    outer_radius = size // 3
    inner_radius = size // 6
    
    draw_star_polygon(
        draw, 
        center, center,
        outer_radius, inner_radius,
        fill='#FFD700',
        outline='#FFA000',
        width=max(1, size // 32)
    )
    
    # Add text for larger icons
    if size >= 48:
        try:
            # Try to use a nice font
            font_size = size // 8
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            # Fall back to default font
            font = ImageFont.load_default()
        
        text = "RMP"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        text_x = (size - text_width) // 2
        text_y = size - text_height - size // 16
        
        draw.text((text_x, text_y), text, fill='white', font=font)
    
    # Save the icon
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """Generate all icon files"""
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Generate icons
    create_icon(16, 'icons/icon16.png')
    create_icon(48, 'icons/icon48.png')
    create_icon(128, 'icons/icon128.png')
    
    print("\nAll icons created successfully!")
    print("You can now load the extension in Chrome.")

if __name__ == '__main__':
    main()

