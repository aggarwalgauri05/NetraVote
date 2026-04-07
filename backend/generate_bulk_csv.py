import csv
import os
import random
from datetime import datetime

def generate_data():
    base_path = "c:\\Users\\Anushree Jain\\.gemini\\antigravity\\scratch\\GHOST-VOTER-NETWORK\\backend\\data"
    os.makedirs(base_path, exist_ok=True)
    
    # 1. Constituencies (id, name, state)
    with open(os.path.join(base_path, "constituencies.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "state"])
        writer.writerows([
            ["New Delhi", "New Delhi", "Delhi"],
            ["Varanasi", "Varanasi", "Uttar Pradesh"],
            ["Mumbai North", "Mumbai North", "Maharashtra"]
        ])

    # 2. Booths (id, name, constituency, state)
    with open(os.path.join(base_path, "booths.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "constituency", "state"])
        writer.writerows([
            ["BOOTH_ND_1", "Green Park School", "New Delhi", "Delhi"],
            ["BOOTH_VAR_99", "Ghat View Primary", "Varanasi", "Uttar Pradesh"],
            ["BOOTH_MUM_10", "Andheri West Center", "Mumbai North", "Maharashtra"]
        ])

    # 3. Addresses (id, full_address, pin_code, state, voter_density)
    addresses = [
        ["ADDR_ND_GHOST", "Flat 101, Block C, Green Park, New Delhi", "110016", "Delhi", 35],
        ["ADDR_VAR_SPIKE", "Assi Ghat Tower, Varanasi", "221001", "Uttar Pradesh", 1],
        ["ADDR_MUM_DUP_1", "Shivaji Park Apt 1, Mumbai", "400028", "Maharashtra", 2]
    ]
    with open(os.path.join(base_path, "addresses.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "address", "pincode", "state", "density"])
        writer.writerows(addresses)

    # 4. Voters (id, name, age, gender, epic, added_date, booth_id, address_id, risk)
    voters = []
    
    # New Delhi Ghosts
    for i in range(35):
        vid = f"V_ND_{1000+i}"
        voters.append([vid, f"ND_Ghost_Voter_{i}", random.randint(20, 80), random.choice(["M", "F"]), f"EPIC_ND_G_{i}", "2023-11-20", "BOOTH_ND_1", "ADDR_ND_GHOST", 0.9])
    
    # Varanasi Spike (March 2024)
    spike_date = "2024-03-15"
    for i in range(50):
        vid = f"V_VAR_S_{i}"
        voters.append([vid, f"VAR_Spike_Voter_{i}", random.randint(18, 90), random.choice(["M", "F"]), f"EPIC_VAR_S_{i}", spike_date, "BOOTH_VAR_99", "ADDR_VAR_SPIKE", 0.7])
        
    # Mumbai Duplicates
    for i in range(5):
        name = f"Mumbai_Dup_{i}"
        for j in range(2):
            vid = f"V_MUM_D_{i}_{j}"
            voters.append([vid, name, 45, "M", f"EPIC_MUM_D_{i}", "2024-01-10", "BOOTH_MUM_10", "ADDR_MUM_DUP_1", 0.95])

    # 5. Edges Generation (optional if job handles it)
    # v_id, target_id, type
    edges = []
    # All voters Registered At their address
    # All voters Assigned To their booth
    # All booths Belongs To constituency
    
    with open(os.path.join(base_path, "voters.csv"), 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "age", "gender", "epic", "added_date", "booth_id", "address_id", "risk"])
        writer.writerows(voters)

if __name__ == "__main__":
    generate_data()
    print("CSVs generated successfully.")
