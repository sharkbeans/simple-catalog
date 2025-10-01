<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                "product_code" => "PEN-001",
                "name" => "Black Gel Pen",
                "price" => 1.50,
                "description" => "Smooth writing, quick-drying black gel ink pen with a fine tip.",
                "quantity" => 200,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PEN-002",
                "name" => "Blue Ballpoint Pen (Box of 12)",
                "price" => 8.99,
                "description" => "Economical pack of 12 retractable blue ballpoint pens.",
                "quantity" => 50,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PCL-003",
                "name" => "HB Wooden Pencils (Pack of 10)",
                "price" => 3.49,
                "description" => "Standard HB graphite pencils for writing and drawing.",
                "quantity" => 150,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "NOT-004",
                "name" => "A4 Lined Notebook",
                "price" => 2.99,
                "description" => "100-sheet A4 spiral-bound notebook with college-ruled lines.",
                "quantity" => 180,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "NOT-005",
                "name" => "A5 Blank Sketchpad",
                "price" => 4.50,
                "description" => "50-sheet A5 spiral-bound sketchpad with thick, acid-free blank pages.",
                "quantity" => 100,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "STK-006",
                "name" => "Yellow Sticky Notes (3x3 inch)",
                "price" => 1.25,
                "description" => "Standard 3x3 inch self-adhesive yellow sticky notes (100 sheets per pad).",
                "quantity" => 300,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ADH-007",
                "name" => "Clear Tape Dispenser",
                "price" => 5.99,
                "description" => "Desktop tape dispenser with one roll of clear invisible tape.",
                "quantity" => 75,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ERZ-008",
                "name" => "White Plastic Erasers (Pack of 4)",
                "price" => 2.50,
                "description" => "Smudge-free white plastic erasers for pencil marks.",
                "quantity" => 120,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "MRK-009",
                "name" => "Assorted Highlighters (Pack of 5)",
                "price" => 4.99,
                "description" => "Set of 5 chisel-tip highlighters in fluorescent colors (yellow, pink, blue, green, orange).",
                "quantity" => 90,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "RUL-010",
                "name" => "30cm Clear Plastic Ruler",
                "price" => 1.99,
                "description" => "Transparent 30cm/12-inch plastic ruler with metric and imperial measurements.",
                "quantity" => 160,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CLP-011",
                "name" => "Binder Clips (Medium, Box of 12)",
                "price" => 3.75,
                "description" => "Medium-sized black metal binder clips (32mm) for holding documents.",
                "quantity" => 80,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "FLR-012",
                "name" => "A4 Document Folder (Blue)",
                "price" => 0.75,
                "description" => "Simple blue plastic two-prong folder for A4 documents.",
                "quantity" => 250,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "DRW-013",
                "name" => "Colored Pencils (Set of 24)",
                "price" => 9.99,
                "description" => "Set of 24 pre-sharpened colored pencils in a tin case.",
                "quantity" => 60,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "SCZ-014",
                "name" => "General Purpose Scissors",
                "price" => 3.25,
                "description" => "7-inch stainless steel blade scissors with comfort grip handles.",
                "quantity" => 110,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PNL-015",
                "name" => "Zipper Pencil Case (Black)",
                "price" => 5.50,
                "description" => "Durable black fabric pencil case with a single zipper compartment.",
                "quantity" => 70,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "HOLE-016",
                "name" => "Two-Hole Punch",
                "price" => 12.99,
                "description" => "Standard metal two-hole punch with a capacity of 20 sheets.",
                "quantity" => 40,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "STP-017",
                "name" => "Desktop Stapler",
                "price" => 7.50,
                "description" => "Standard desktop stapler, uses 24/6 or 26/6 staples.",
                "quantity" => 85,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "STP-018",
                "name" => "Standard Staples (Box of 5000)",
                "price" => 2.99,
                "description" => "Box of 5000 standard size 26/6 staples.",
                "quantity" => 130,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAP-019",
                "name" => "A4 White Printer Paper (Ream of 500)",
                "price" => 6.99,
                "description" => "500 sheets of 80gsm A4 multipurpose white printer paper.",
                "quantity" => 200,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CAL-020",
                "name" => "Desk Calculator",
                "price" => 15.00,
                "description" => "12-digit desktop calculator with large display and solar power backup.",
                "quantity" => 30,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ADH-021",
                "name" => "Glue Stick (Large)",
                "price" => 1.75,
                "description" => "Large, non-toxic, washable glue stick for paper and cardboard.",
                "quantity" => 150,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "DIV-022",
                "name" => "A4 Index Dividers (Set of 5)",
                "price" => 3.99,
                "description" => "Set of 5 colored tab index dividers for A4 binders.",
                "quantity" => 95,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "SHP-023",
                "name" => "Manual Pencil Sharpener",
                "price" => 1.99,
                "description" => "Single-hole manual sharpener with a metal blade and shavings receptacle.",
                "quantity" => 140,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAP-024",
                "name" => "Legal Pads (A4, Yellow, Pack of 3)",
                "price" => 7.99,
                "description" => "Pack of 3 yellow A4 legal pads, perforated sheets.",
                "quantity" => 65,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "MRK-025",
                "name" => "Fine-Tip Permanent Markers (Black, Pack of 2)",
                "price" => 3.99,
                "description" => "Two black fine-tip permanent markers, quick-drying ink.",
                "quantity" => 105,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "TAG-026",
                "name" => "Paper Clips (Box of 100)",
                "price" => 0.99,
                "description" => "Box of 100 standard silver paper clips (33mm).",
                "quantity" => 220,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "NOT-027",
                "name" => "Pocket Memo Pad",
                "price" => 0.75,
                "description" => "Small, lined 70-sheet memo pad (A7 size) perfect for pockets.",
                "quantity" => 180,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "FIL-028",
                "name" => "Suspension Files (Box of 10, Green)",
                "price" => 14.99,
                "description" => "Box of 10 green A4 suspension files for filing cabinets.",
                "quantity" => 50,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "COR-029",
                "name" => "Correction Tape Dispenser",
                "price" => 2.50,
                "description" => "Dry correction tape (5mm x 6m) for instant rewriting.",
                "quantity" => 115,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PEN-030",
                "name" => "Fountain Pen Ink Cartridges (Black, Pack of 5)",
                "price" => 4.50,
                "description" => "Pack of 5 standard international size black ink cartridges.",
                "quantity" => 70,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "DRW-031",
                "name" => "Oil Pastels (Set of 12)",
                "price" => 6.99,
                "description" => "Set of 12 vibrant oil pastels for artistic use.",
                "quantity" => 55,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "RUL-032",
                "name" => "Geometry Compass Set",
                "price" => 8.50,
                "description" => "Metal geometry compass and protractor set in a protective case.",
                "quantity" => 45,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "MAG-033",
                "name" => "Magazine File Holder (Black)",
                "price" => 4.25,
                "description" => "Black plastic magazine file for desk or shelf organization.",
                "quantity" => 90,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAP-034",
                "name" => "Colored Card Stock (Assorted, 50 Sheets)",
                "price" => 5.99,
                "description" => "50 sheets of heavy-weight colored card stock (A4 size, assorted colors).",
                "quantity" => 75,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CUT-035",
                "name" => "Utility Knife / Box Cutter",
                "price" => 4.99,
                "description" => "Retractable utility knife with a safety lock and snap-off blade.",
                "quantity" => 60,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAD-036",
                "name" => "Ink Stamp Pad (Black)",
                "price" => 3.50,
                "description" => "Standard size black ink stamp pad, suitable for rubber stamps.",
                "quantity" => 100,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ELB-037",
                "name" => "Rubber Bands (Assorted Sizes, 100g)",
                "price" => 1.99,
                "description" => "100g bag of assorted size durable rubber bands.",
                "quantity" => 130,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAP-038",
                "name" => "Tracing Paper Pad (A3)",
                "price" => 8.99,
                "description" => "A3 pad of 50 sheets of high-transparency tracing paper.",
                "quantity" => 40,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CLP-039",
                "name" => "Push Pins (Assorted Colors, Box of 50)",
                "price" => 2.25,
                "description" => "Box of 50 standard thumb tacks/push pins with assorted color plastic heads.",
                "quantity" => 150,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "DRW-040",
                "name" => "Watercolors Set (12 Colors)",
                "price" => 7.50,
                "description" => "Basic watercolor paint set with 12 colors and a brush.",
                "quantity" => 80,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "NOT-041",
                "name" => "Grid Ruled Notebook (A5)",
                "price" => 3.50,
                "description" => "A5 spiral-bound notebook with 5mm grid/graph ruling, 80 sheets.",
                "quantity" => 110,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PEN-042",
                "name" => "Red Permanent Marker (Chisel Tip)",
                "price" => 1.99,
                "description" => "Bold red ink permanent marker with a versatile chisel tip.",
                "quantity" => 95,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "BIND-043",
                "name" => "A4 Ring Binder (White)",
                "price" => 3.99,
                "description" => "2-ring A4 plastic binder (25mm capacity) in white.",
                "quantity" => 120,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CLE-044",
                "name" => "Screen Cleaning Wipes (Pack of 50)",
                "price" => 6.50,
                "description" => "50 pre-moistened wipes for cleaning computer screens and monitors.",
                "quantity" => 70,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ORG-045",
                "name" => "Desk Organizer Caddy (Mesh)",
                "price" => 18.00,
                "description" => "Black metal mesh desk caddy with multiple compartments for pens, notes, and supplies.",
                "quantity" => 35,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "ADH-046",
                "name" => "Super Glue (3g Tube)",
                "price" => 1.25,
                "description" => "Small 3-gram tube of fast-setting liquid super glue.",
                "quantity" => 160,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PAP-047",
                "name" => "Dot Grid Journal (A5, Hardcover)",
                "price" => 10.99,
                "description" => "A5 hardcover journal with 160 dotted pages, ideal for bullet journaling.",
                "quantity" => 60,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "PEN-048",
                "name" => "Stylus Pen (2-in-1)",
                "price" => 2.99,
                "description" => "Combination ballpoint pen and capacitive stylus for touchscreens.",
                "quantity" => 100,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "FLR-049",
                "name" => "Plastic Sheet Protectors (Box of 100)",
                "price" => 9.50,
                "description" => "Box of 100 clear A4 plastic sheet protectors, multi-punched.",
                "quantity" => 50,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ],
            [
                "product_code" => "CLP-050",
                "name" => "Bulldog Clips (Large, Pack of 5)",
                "price" => 4.99,
                "description" => "Pack of 5 large metal bulldog clips (60mm) for heavy-duty clamping.",
                "quantity" => 80,
                "image_url" => "https://picsum.photos/seed/picsum/200/300"
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
