import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Video, Plus, AlertCircle, ChevronRight, Sparkles,
  MapPin, CheckCircle2, ChevronLeft, ShieldAlert,
  ArrowUp, ArrowDown, Eye, RefreshCw, Edit3
} from 'lucide-react';
import { Button, Input, Textarea, Select, SearchableSelect } from '../ui';
import { CONDITIONS, CITIES } from '../../utils/constants';
import { categoriesService } from '../../services';
import { supabase } from '../../lib/supabase';
import { listingsService } from '../../services/listingsService';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import { Category, Listing } from '../../types';
import { validateImageFile, validateVideoFile, cn, cleanUuid } from '../../utils/helpers';
import { getPriceEnabled } from '../../utils/standardAttributes';
import Icon from '../ui/Icon';
import toast from 'react-hot-toast';
import suzukiLogo from '../../assets/suzuki.png';
import toyotaLogo from '../../assets/toyota.png';
import hondaLogo from '../../assets/honda.png';
import daihatsuLogo from '../../assets/daihatsu.png';
import nissanLogo from '../../assets/nissan.png';
import adamLogo from '../../assets/adam.png';
import audiLogo from '../../assets/audi.png';
import baicLogo from '../../assets/baic.png';
import bentleyLogo from '../../assets/bentley.png';
import bmwLogo from '../../assets/bmw.png';
import buickLogo from '../../assets/buick.png';
import bydLogo from '../../assets/byd.png';
import cadillacLogo from '../../assets/cadillac.png';
import changanLogo from '../../assets/changan.png';
import cheryLogo from '../../assets/chery.png';
import chevroletLogo from '../../assets/chevrolet.png';
import chryslerLogo from '../../assets/chrysler.png';
import classicAntiquesLogo from '../../assets/classic-antiques.png';
import daewooLogo from '../../assets/daewoo.png';
import datsunLogo from '../../assets/datsun.png';
import deepalLogo from '../../assets/deepal.png';
import dfskLogo from '../../assets/dfsk.png';
import dodgeLogo from '../../assets/dodge.png';
import dongfengLogo from '../../assets/dongfeng.png';
import fawLogo from '../../assets/faw.png';
import fiatLogo from '../../assets/fiat.png';
import fordLogo from '../../assets/ford.png';
import gmcLogo from '../../assets/gmc.png';
import gwmLogo from '../../assets/gwm.png';
import havalLogo from '../../assets/haval.png';
import hinoLogo from '../../assets/hino.png';
import honriLogo from '../../assets/honri.png';
import hummerLogo from '../../assets/hummer.png';
import hyundaiLogo from '../../assets/hyundai.png';
import inverexLogo from '../../assets/inverex.png';
import isuzuLogo from '../../assets/isuzu.png';
import jacLogo from '../../assets/jac.png';
import jaecooLogo from '../../assets/jaecoo.png';
import jaguarLogo from '../../assets/jaguar.png';
import jeepLogo from '../../assets/jeep.png';
import jetourLogo from '../../assets/jetour.png';
import jwForlandLogo from '../../assets/jw-fortland.png';
import kiaLogo from '../../assets/kia.png';
import landRoverLogo from '../../assets/land-rover.png';
import lexusLogo from '../../assets/lexus.png';
import mazdaLogo from '../../assets/mazda.png';
import mercedesLogo from '../../assets/mercedes-benz.png';
import mgLogo from '../../assets/mg.png';
import mitsubishiLogo from '../../assets/mitsubishi.png';
import mushtaqLogo from '../../assets/mushtaq.png';
import peugeotLogo from '../../assets/peugeot.png';
import porscheLogo from '../../assets/porsche.png';
import princeLogo from '../../assets/prince.png';
import protonLogo from '../../assets/proton.png';
import rangeRoverLogo from '../../assets/range-rover.png';
import renaultLogo from '../../assets/renault.png';
import seresLogo from '../../assets/seres.png';
import ssangyongLogo from '../../assets/ssang-yong.png';
import subaruLogo from '../../assets/subaru.png';
import teslaLogo from '../../assets/tesla.png';
import unitedLogo from '../../assets/united.png';
import volkswagenLogo from '../../assets/volkswagen.png';
import zotyeLogo from '../../assets/zotye.png';
import otherBrandsLogo from '../../assets/other-brands.png';

// This is the brand list that should be used
const STATIC_BRANDS = [
  { id: 'apple-id', name: 'Apple' },
  { id: 'samsung-id', name: 'Samsung' },
  { id: 'google-id', name: 'Google' },
  { id: 'xiaomi-id', name: 'Xiaomi' },
  { id: 'oneplus-id', name: 'OnePlus' },
  { id: 'oppo-id', name: 'OPPO' },
  { id: 'vivo-id', name: 'Vivo' },
  { id: 'infinix-id', name: 'Infinix' },
  { id: 'tecno-id', name: 'Tecno' },
  { id: 'realme-id', name: 'Realme' },
  { id: 'motorola-id', name: 'Motorola' },
  { id: 'nokia-id', name: 'Nokia' },
  { id: 'huawei-id', name: 'Huawei' },
  { id: 'honor-id', name: 'Honor' },
  { id: 'sony-id', name: 'Sony' },
  { id: 'lg-id', name: 'LG' },
  { id: 'itel-id', name: 'Itel' },
  { id: 'zte-id', name: 'ZTE' },
  { id: 'htc-id', name: 'HTC' },
  { id: 'lenovo-id', name: 'Lenovo' },
  { id: 'asus-id', name: 'Asus' },
  { id: 'blackberry-id', name: 'BlackBerry' },
  { id: 'tcl-id', name: 'TCL' },
  { id: 'microsoft-id', name: 'Microsoft' },
  { id: 'panasonic-id', name: 'Panasonic' },
  { id: 'acer-id', name: 'Acer' },
  { id: 'meizu-id', name: 'Meizu' },
  { id: 'gionee-id', name: 'Gionee' },
  { id: 'lava-id', name: 'Lava' },
  { id: 'hisense-id', name: 'Hisense' },
  { id: 'nothing-id', name: 'Nothing' },
  { id: 'hmd-id', name: 'HMD' },
  { id: 'philips-id', name: 'Philips' },
  { id: 'sharp-id', name: 'Sharp' },
  { id: 'razer-id', name: 'Razer' },
  { id: 't-mobile-id', name: 'T-Mobile' },
  { id: 'fairphone-id', name: 'Fairphone' },
  { id: 'cubot-id', name: 'Cubot' },
  { id: 'doogee-id', name: 'Doogee' },
  { id: 'ulefone-id', name: 'Ulefone' },
  { id: 'umidigi-id', name: 'UMIDIGI' },
  { id: 'blackview-id', name: 'Blackview' },
  { id: 'coolpad-id', name: 'Coolpad' },
  { id: 'cat-id', name: 'Cat' },
  { id: 'kyocera-id', name: 'Kyocera' },
  { id: 'spice-id', name: 'Spice' },
  { id: 'sparx-id', name: 'Sparx' },
  { id: 'qmobile-id', name: 'QMobile' },
  { id: 'calme-id', name: 'Calme' },
  { id: 'club-id', name: 'Club' },
  { id: 'mobilink-jazzx-id', name: 'Mobilink JazzX' },
  { id: 'gfive-id', name: 'GFive' },
  { id: 'haier-id', name: 'Haier' },
  { id: 'voice-id', name: 'Voice' },
  { id: 'rivo-id', name: 'RIVO' },
  { id: 'g-tide-id', name: 'G-TIDE' },
  { id: 'gright-id', name: 'Gright' },
  { id: 'innjoo-id', name: 'Innjoo' },
  { id: 'oscal-id', name: 'Oscal' },
  { id: 'oukitel-id', name: 'Oukitel' },
  { id: 'villaon-id', name: 'Villaon' },
  { id: 'wiko-id', name: 'Wiko' },
  { id: 'xmobile-id', name: 'XMobile' },
  { id: 'xsmart-id', name: 'XSmart' },
  { id: 'allcall-id', name: 'AllCall' },
  { id: 'blu-id', name: 'BLU' },
  { id: 'archos-id', name: 'Archos' },
  { id: 'dcode-id', name: 'Dcode' },
  { id: 'energizer-id', name: 'Energizer' },
  { id: 'e-tachi-id', name: 'E-Tachi' },
  { id: 'faywa-id', name: 'Faywa' },
  { id: 'gresso-id', name: 'Gresso' },
  { id: 'inew-id', name: 'iNew' },
  { id: 'kxd-id', name: 'KXD' },
  { id: 'me-mobile-id', name: 'Me Mobile' },
  { id: 'sego-id', name: 'Sego' },
  { id: 'sonim-id', name: 'Sonim' },
  { id: 'vgo-tel-id', name: 'VGO TEL' },
  { id: 'vnus-id', name: 'Vnus' },
  { id: 'xtouch-id', name: 'Xtouch' },
  { id: 'alcatel-id', name: 'Alcatel' },
  { id: 'sony-ericsson-id', name: 'Sony Ericsson' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Tablets
const STATIC_TABLET_BRANDS = [
  { id: 'tab-apple-id', name: 'Apple' },
  { id: 'tab-dany-id', name: 'Dany Tabs' },
  { id: 'tab-huawei-id', name: 'Huawei' },
  { id: 'tab-lenovo-id', name: 'Lenovo' },
  { id: 'tab-amazon-id', name: 'Amazon' },
  { id: 'tab-asus-id', name: 'Asus' },
  { id: 'tab-dell-id', name: 'Dell' },
  { id: 'tab-alcatel-id', name: 'Alcatel' },
  { id: 'tab-huion-id', name: 'Huion' },
  { id: 'tab-wacom-id', name: 'Wacom' },
  { id: 'tab-acer-id', name: 'Acer' },
  { id: 'tab-honor-id', name: 'Honor' },
  { id: 'tab-rca-id', name: 'RCA' },
  { id: 'tab-mione-id', name: 'Mione' },
  { id: 'tab-qtabs-id', name: 'Q Tabs' },
  { id: 'tab-samsung-id', name: 'Samsung' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the type list that should be used for Laptops
const STATIC_LAPTOP_TYPES = [
  { id: 'type-chromebook', name: 'Chrome Books' },
  { id: 'type-macbook', name: 'MacBooks' },
  { id: 'type-netbook', name: 'Netbooks' },
  { id: 'type-other', name: 'Other Laptops' },
  { id: 'type-traditional', name: 'Traditional Laptops' },
  { id: 'type-ultrabook', name: 'Ultrabooks' },
];

const STATIC_LAPTOP_GENERATIONS = [
  '1st Gen', '2nd Gen', '3rd Gen', '4th Gen', '5th Gen', '6th Gen',
  '7th Gen', '8th Gen', '9th Gen', '10th Gen', '11th Gen', '12th Gen',
  '13th Gen', '14th Gen', '15th Gen', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Other'
];

const STATIC_LAPTOP_CORES = [
  'Core i3', 'Core i5', 'Core i7', 'Core i9', 'Core2 Duo', 'Dual Core',
  'Quad Core', 'Xeon', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9',
  'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4', 'Other'
];

const STATIC_LAPTOP_RAMS = [
  '4 GB', '8 GB', '12 GB', '16 GB', '24 GB', '32 GB', '64 GB', '128 GB'
];

const STATIC_LAPTOP_STORAGES = [
  '128 GB SSD', '256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD',
  '500 GB HDD', '1 TB HDD', '2 TB HDD'
];

// This is the type list that should be used for Other Accessories under Computers
const STATIC_ACCESSORY_TYPES = [
  { id: 'acc-motherboard', name: 'Motherboard' },
  { id: 'acc-gpu', name: 'Graphics Card (GPU)' },
  { id: 'acc-ram', name: 'RAM (Memory)' },
  { id: 'acc-ssd', name: 'SSD' },
  { id: 'acc-hdd', name: 'HDD (Hard Disk Drive)' },
  { id: 'acc-nvme-ssd', name: 'NVMe SSD' },
  { id: 'acc-psu', name: 'Power Supply (PSU)' },
  { id: 'acc-pc-case', name: 'PC Case (Cabinet)' },
  { id: 'acc-cpu-cooler', name: 'CPU Cooler' },
  { id: 'acc-case-fans', name: 'Case Fans' },
  { id: 'acc-optical-drive', name: 'Optical Drive (DVD/CD Drive)' },
  { id: 'acc-sound-card', name: 'Sound Card' },
  { id: 'acc-network-card', name: 'Network Card (LAN/Wi-Fi Card)' },
  { id: 'acc-rgb-components', name: 'RGB Components' },
  { id: 'acc-thermal-paste', name: 'Thermal Paste' },
  { id: 'acc-cmos-battery', name: 'CMOS Battery' },
  { id: 'acc-internal-cables', name: 'Internal Cables' },
  { id: 'manual-add-type', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Laptops
const STATIC_LAPTOP_BRANDS = [
  { id: 'lap-acer-id', name: 'Acer' },
  { id: 'lap-apple-id', name: 'Apple' },
  { id: 'lap-asus-id', name: 'ASUS' },
  { id: 'lap-dell-id', name: 'Dell' },
  { id: 'lap-hp-id', name: 'HP' },
  { id: 'lap-infinix-id', name: 'Infinix' },
  { id: 'lap-lenovo-id', name: 'Lenovo' },
  { id: 'lap-microsoft-id', name: 'Microsoft' },
  { id: 'lap-msi-id', name: 'MSI' },
  { id: 'lap-razer-id', name: 'Razer' },
  { id: 'lap-samsung-id', name: 'Samsung' },
  { id: 'lap-toshiba-id', name: 'Toshiba' },
];

// This is the brand list that should be used for Gaming Consoles
const STATIC_CONSOLE_BRANDS = [
  { id: 'con-acer-id', name: 'Acer' },
  { id: 'con-alienware-id', name: 'Alienware' },
  { id: 'con-aorus-id', name: 'Aorus' },
  { id: 'con-corsair-id', name: 'Corsair' },
  { id: 'con-lenovo-id', name: 'Lenovo' },
  { id: 'con-msi-id', name: 'MSI' },
  { id: 'con-omen-id', name: 'Omen' },
  { id: 'con-razer-id', name: 'Razer' },
  { id: 'con-rog-id', name: 'ROG' },
  { id: 'con-zotac-id', name: 'Zotac' },
  { id: 'con-others-id', name: 'Others' }
];

const STATIC_TRUCK_BRANDS = [
  { id: 'truck-hino', name: 'Hino' },
  { id: 'truck-isuzu', name: 'Isuzu' },
  { id: 'truck-master', name: 'Master' },
  { id: 'truck-daewoo', name: 'Daewoo' },
  { id: 'truck-yutong', name: 'Yutong' },
  { id: 'truck-faw', name: 'FAW' },
  { id: 'truck-jmc', name: 'JMC' },
  { id: 'truck-jac', name: 'JAC' },
  { id: 'truck-kamaz', name: 'Kamaz' },
  { id: 'truck-volvo', name: 'Volvo' },
  { id: 'truck-scania', name: 'Scania' },
  { id: 'truck-others', name: 'Others' }
];

const STATIC_RICKSHAW_BRANDS = [
  { id: 'rick-sazgar', name: 'Sazgar' },
  { id: 'rick-qingqi', name: 'Qingqi' },
  { id: 'rick-road-prince', name: 'Road Prince' },
  { id: 'rick-new-asia', name: 'New Asia' },
  { id: 'rick-united', name: 'United' },
  { id: 'rick-tez-raftar', name: 'Tez Raftar' },
  { id: 'rick-crown', name: 'Crown' },
  { id: 'rick-habib', name: 'Habib' },
  { id: 'rick-others', name: 'Others' }
];

const STATIC_TRACTOR_BRANDS = [
  { id: 'trac-massey-ferguson', name: 'Massey Ferguson' },
  { id: 'trac-fiat-alghazi', name: 'Fiat / Al-Ghazi' },
  { id: 'trac-belarus', name: 'Belarus' },
  { id: 'trac-john-deere', name: 'John Deere' },
  { id: 'trac-ford', name: 'Ford' },
  { id: 'trac-imt', name: 'IMT' },
  { id: 'trac-ursus', name: 'Ursus' },
  { id: 'trac-others', name: 'Others' }
];

const STATIC_STANDARD_BIKE_BRANDS = [
  { id: 'sb-honda', name: 'Honda' },
  { id: 'sb-yamaha', name: 'Yamaha' },
  { id: 'sb-suzuki', name: 'Suzuki' },
  { id: 'sb-united', name: 'United' },
  { id: 'sb-road-prince', name: 'Road Prince' },
  { id: 'sb-unique', name: 'Unique' },
  { id: 'sb-super-power', name: 'Super Power' },
  { id: 'sb-super-star', name: 'Super Star' },
  { id: 'sb-union-star', name: 'Union Star' },
  { id: 'sb-hi-speed', name: 'Hi Speed' },
  { id: 'sb-crown', name: 'Crown' },
  { id: 'sb-metro', name: 'Metro' },
  { id: 'sb-ravi', name: 'Ravi' },
  { id: 'sb-hero', name: 'Hero' },
  { id: 'sb-kawasaki', name: 'Kawasaki' },
  { id: 'sb-super-asia', name: 'Super Asia' },
  { id: 'sb-power', name: 'Power' },
  { id: 'sb-pak-hero', name: 'Pak Hero' },
  { id: 'sb-safari', name: 'Safari' },
  { id: 'sb-benelli', name: 'Benelli' },
  { id: 'sb-eagle', name: 'Eagle' },
  { id: 'sb-treet', name: 'Treet' },
  { id: 'sb-ghani', name: 'Ghani' },
  { id: 'sb-habib', name: 'Habib' },
  { id: 'sb-lifan', name: 'Lifan' },
  { id: 'sb-sohrab', name: 'Sohrab' },
  { id: 'sb-derbi', name: 'Derbi' },
  { id: 'sb-zongshen', name: 'Zongshen' },
  { id: 'sb-qingqi', name: 'Qingqi' },
  { id: 'sb-toyo', name: 'Toyo' },
  { id: 'sb-cineco', name: 'Cineco' },
  { id: 'sb-cf-moto', name: 'CF Moto' },
  { id: 'sb-zxmco', name: 'Zxmco' },
];

const STATIC_CRUISER_BRANDS = [
  { id: 'cr-harley', name: 'Harley-Davidson' },
  { id: 'cr-honda', name: 'Honda' },
  { id: 'cr-hi-speed', name: 'Hi Speed' },
  { id: 'cr-suzuki', name: 'Suzuki' },
  { id: 'cr-zongshen', name: 'Zongshen' },
  { id: 'cr-jonway', name: 'Jonway' },
  { id: 'cr-yamaha', name: 'Yamaha' },
  { id: 'cr-benelli', name: 'Benelli' },
  { id: 'cr-kawasaki', name: 'Kawasaki' },
  { id: 'cr-voge', name: 'Voge' },
  { id: 'cr-others', name: 'Others' }
];

const STATIC_ELECTRIC_BIKE_BRANDS = [
  { id: 'eb-jolta', name: 'Jolta' },
  { id: 'eb-ms-jaguar', name: 'MS Jaguar' },
  { id: 'eb-metro', name: 'Metro E-Vehicle' },
  { id: 'eb-pakzon', name: 'PakZon Electric' },
  { id: 'eb-road-prince', name: 'Road Prince' },
  { id: 'eb-okla', name: 'Okla' },
  { id: 'eb-vlektra', name: 'Vlektra' },
  { id: 'eb-e-turbo', name: 'E Turbo' },
  { id: 'eb-zhong-fa', name: 'Zhong Fa' },
  { id: 'eb-united', name: 'United' },
  { id: 'eb-crown', name: 'Crown' },
  { id: 'eb-others', name: 'Others' }
];

const STATIC_SPORTS_HEAVY_BIKE_BRANDS = [
  { id: 'shb-honda', name: 'Honda' },
  { id: 'shb-kawasaki', name: 'Kawasaki' },
  { id: 'shb-suzuki', name: 'Suzuki' },
  { id: 'shb-yamaha', name: 'Yamaha' },
  { id: 'shb-super-power', name: 'Super Power' },
  { id: 'shb-super-star', name: 'Super Star' },
  { id: 'shb-bmw', name: 'BMW' },
  { id: 'shb-cf-moto', name: 'CF Moto' },
  { id: 'shb-cyclone', name: 'Cyclone' },
  { id: 'shb-ducati', name: 'Ducati' },
  { id: 'shb-super-asia', name: 'Super Asia' },
  { id: 'shb-voge', name: 'Voge' },
  { id: 'shb-others', name: 'Others' }
];

const STATIC_TRAIL_BIKE_BRANDS = [
  { id: 'tb-yamaha', name: 'Yamaha' },
  { id: 'tb-suzuki', name: 'Suzuki' },
  { id: 'tb-zongshen', name: 'Zongshen' },
  { id: 'tb-kawasaki', name: 'Kawasaki' },
  { id: 'tb-cineco', name: 'Cineco' },
  { id: 'tb-qingqi', name: 'Qingqi' },
  { id: 'tb-others', name: 'Others' }
];

const STATIC_CAFE_RACER_BRANDS = [
  { id: 'cfr-hi-speed', name: 'Hi Speed' },
  { id: 'cfr-super-star', name: 'Super Star' },
  { id: 'cfr-benelli', name: 'Benelli' },
  { id: 'cfr-cf-moto', name: 'CF Moto' },
  { id: 'cfr-bmw', name: 'BMW' },
  { id: 'cfr-cyclone', name: 'Cyclone' },
  { id: 'cfr-qingqi', name: 'Qingqi' },
  { id: 'cfr-zongshen', name: 'Zongshen' },
  { id: 'cfr-others', name: 'Others' }
];

const STATIC_ELECTRIC_SCOOTER_BRANDS = [
  { id: 'esc-honda', name: 'Honda' },
  { id: 'esc-united', name: 'United' },
  { id: 'esc-zhong-fa', name: 'Zhong Fa' },
  { id: 'esc-yj-future', name: 'YJ Future' },
  { id: 'esc-jinpeng', name: 'Jinpeng' },
  { id: 'esc-evee', name: 'Evee' },
  { id: 'esc-eveon', name: 'Eveon' },
  { id: 'esc-metro', name: 'Metro' },
  { id: 'esc-ms-jaguar', name: 'MS Jaguar' },
  { id: 'esc-okla', name: 'OKLA' },
  { id: 'esc-ramza', name: 'Ramza' },
  { id: 'esc-yadea', name: 'Yadea' },
  { id: 'esc-king', name: 'KING' },
  { id: 'esc-others', name: 'Others' }
];

const STATIC_PETROL_SCOOTER_BRANDS = [
  { id: 'psc-honda', name: 'Honda' },
  { id: 'psc-vespa', name: 'Vespa' },
  { id: 'psc-yamaha', name: 'Yamaha' },
  { id: 'psc-suzuki', name: 'Suzuki' },
  { id: 'psc-united', name: 'United' },
  { id: 'psc-road-prince', name: 'Road Prince' },
  { id: 'psc-crown', name: 'Crown' },
  { id: 'psc-super-power', name: 'Super Power' },
  { id: 'psc-qingqi', name: 'Qingqi' },
  { id: 'psc-others', name: 'Others' }
];

const STATIC_MOTORCYCLE_BRANDS = [
  { id: 'bike-honda', name: 'Honda' },
  { id: 'bike-yamaha', name: 'Yamaha' },
  { id: 'bike-suzuki', name: 'Suzuki' },
  { id: 'bike-kawasaki', name: 'Kawasaki' },
  { id: 'bike-road-prince', name: 'Road Prince' },
  { id: 'bike-unique', name: 'Unique' },
  { id: 'bike-super-power', name: 'Super Power' },
  { id: 'bike-united', name: 'United' },
  { id: 'bike-hi-speed', name: 'Hi-Speed' },
  { id: 'bike-crown', name: 'Crown' },
  { id: 'bike-vespa', name: 'Vespa' },
  { id: 'bike-zontes', name: 'Zontes' },
  { id: 'bike-benelli', name: 'Benelli' },
  { id: 'bike-keeway', name: 'Keeway' },
  { id: 'bike-harley', name: 'Harley Davidson' },
  { id: 'bike-bmw', name: 'BMW' },
  { id: 'bike-others', name: 'Others' }
];

const STATIC_BICYCLE_BRANDS = [
  { id: 'bicy-speed', name: 'Speed' },
  { id: 'bicy-morgan', name: 'Morgan' },
  { id: 'bicy-sohrab', name: 'Sohrab' },
  { id: 'bicy-specialized', name: 'Specialized' },
  { id: 'bicy-giant', name: 'Giant' },
  { id: 'bicy-goodwin', name: 'Goodwin' },
  { id: 'bicy-cobalt', name: 'Cobalt' },
  { id: 'bicy-louis', name: 'Louis' },
  { id: 'bicy-precision', name: 'Precision' },
  { id: 'bicy-scott', name: 'Scott' },
  { id: 'bicy-continental', name: 'Continental' },
  { id: 'bicy-bianchi', name: 'Bianchi' },
  { id: 'bicy-trinx', name: 'Trinx' },
  { id: 'bicy-fareast', name: 'Fareast' },
  { id: 'bicy-others', name: 'Others' }
];

const STATIC_SCOOTER_BRANDS = [
  { id: 'scoot-vespa', name: 'Vespa' },
  { id: 'scoot-honda', name: 'Honda' },
  { id: 'scoot-suzuki', name: 'Suzuki' },
  { id: 'scoot-yamaha', name: 'Yamaha' },
  { id: 'scoot-united', name: 'United' },
  { id: 'scoot-road-prince', name: 'Road Prince' },
  { id: 'scoot-vlektra', name: 'Vlektra' },
  { id: 'scoot-jolta', name: 'Jolta' },
  { id: 'scoot-ezo', name: 'Ezo' },
  { id: 'scoot-others', name: 'Others' }
];

const STATIC_ATV_BRANDS = [
  { id: 'atv-king', name: 'KING' },
  { id: 'atv-chinese-bikes', name: 'Chinese Bikes' },
  { id: 'atv-yamaha', name: 'Yamaha' },
  { id: 'atv-nptc', name: 'NPTC' },
  { id: 'atv-others', name: 'Others' }
];

// This is the brand list that should be used for Cars
const STATIC_CAR_BRANDS = [
  // Popular Make
  { id: 'car-suzuki', name: 'Suzuki', logoUrl: suzukiLogo },
  { id: 'car-toyota', name: 'Toyota', logoUrl: toyotaLogo },
  { id: 'car-honda', name: 'Honda', logoUrl: hondaLogo },
  { id: 'car-daihatsu', name: 'Daihatsu', logoUrl: daihatsuLogo },
  { id: 'car-nissan', name: 'Nissan', logoUrl: nissanLogo },
  
  // Others
  { id: 'car-adam', name: 'Adam', logoUrl: adamLogo },
  { id: 'car-audi', name: 'Audi', logoUrl: audiLogo },
  { id: 'car-baic', name: 'BAIC', logoUrl: baicLogo },
  { id: 'car-bentley', name: 'Bentley', logoUrl: bentleyLogo },
  { id: 'car-bmw', name: 'BMW', logoUrl: bmwLogo },
  { id: 'car-buick', name: 'Buick', logoUrl: buickLogo },
  { id: 'car-byd', name: 'BYD', logoUrl: bydLogo },
  { id: 'car-cadillac', name: 'Cadillac', logoUrl: cadillacLogo },
  { id: 'car-changan', name: 'Changan', logoUrl: changanLogo },
  { id: 'car-chery', name: 'Chery', logoUrl: cheryLogo },
  { id: 'car-chevrolet', name: 'Chevrolet', logoUrl: chevroletLogo },
  { id: 'car-chrysler', name: 'Chrysler', logoUrl: chryslerLogo },
  { id: 'car-classic-antiques', name: 'Classic & Antiques', logoUrl: classicAntiquesLogo },
  { id: 'car-daewoo', name: 'Daewoo', logoUrl: daewooLogo },
  { id: 'car-datsun', name: 'Datsun', logoUrl: datsunLogo },
  { id: 'car-deepal', name: 'Deepal', logoUrl: deepalLogo },
  { id: 'car-dfsk', name: 'DFSK', logoUrl: dfskLogo },
  { id: 'car-dodge', name: 'Dodge', logoUrl: dodgeLogo },
  { id: 'car-dongfeng', name: 'Dongfeng', logoUrl: dongfengLogo },
  { id: 'car-faw', name: 'FAW', logoUrl: fawLogo },
  { id: 'car-fiat', name: 'Fiat', logoUrl: fiatLogo },
  { id: 'car-ford', name: 'Ford', logoUrl: fordLogo },
  { id: 'car-gmc', name: 'GMC', logoUrl: gmcLogo },
  { id: 'car-gwm', name: 'GWM', logoUrl: gwmLogo },
  { id: 'car-haval', name: 'Haval', logoUrl: havalLogo },
  { id: 'car-hino', name: 'Hino', logoUrl: hinoLogo },
  { id: 'car-honri', name: 'Honri', logoUrl: honriLogo },
  { id: 'car-hummer', name: 'Hummer', logoUrl: hummerLogo },
  { id: 'car-hyundai', name: 'Hyundai', logoUrl: hyundaiLogo },
  { id: 'car-inverex', name: 'Inverex', logoUrl: inverexLogo },
  { id: 'car-isuzu', name: 'Isuzu', logoUrl: isuzuLogo },
  { id: 'car-jac', name: 'JAC', logoUrl: jacLogo },
  { id: 'car-jaecoo', name: 'Jaecoo', logoUrl: jaecooLogo },
  { id: 'car-jaguar', name: 'Jaguar', logoUrl: jaguarLogo },
  { id: 'car-jeep', name: 'Jeep', logoUrl: jeepLogo },
  { id: 'car-jetour', name: 'Jetour', logoUrl: jetourLogo },
  { id: 'car-jw-forland', name: 'JW Forland', logoUrl: jwForlandLogo },
  { id: 'car-kia', name: 'KIA', logoUrl: kiaLogo },
  { id: 'car-land-rover', name: 'Land Rover', logoUrl: landRoverLogo },
  { id: 'car-lexus', name: 'Lexus', logoUrl: lexusLogo },
  { id: 'car-mazda', name: 'Mazda', logoUrl: mazdaLogo },
  { id: 'car-mercedes', name: 'Mercedes', logoUrl: mercedesLogo },
  { id: 'car-mg', name: 'MG', logoUrl: mgLogo },
  { id: 'car-mitsubishi', name: 'Mitsubishi', logoUrl: mitsubishiLogo },
  { id: 'car-mushtaq', name: 'Mushtaq', logoUrl: mushtaqLogo },
  { id: 'car-peugeot', name: 'Peugeot', logoUrl: peugeotLogo },
  { id: 'car-porsche', name: 'Porsche', logoUrl: porscheLogo },
  { id: 'car-prince', name: 'Prince', logoUrl: princeLogo },
  { id: 'car-proton', name: 'Proton', logoUrl: protonLogo },
  { id: 'car-range-rover', name: 'Range Rover', logoUrl: rangeRoverLogo },
  { id: 'car-renault', name: 'Renault', logoUrl: renaultLogo },
  { id: 'car-seres', name: 'Seres', logoUrl: seresLogo },
  { id: 'car-ssangyong', name: 'Ssangyong', logoUrl: ssangyongLogo },
  { id: 'car-subaru', name: 'Subaru', logoUrl: subaruLogo },
  { id: 'car-tesla', name: 'Tesla', logoUrl: teslaLogo },
  { id: 'car-united', name: 'United', logoUrl: unitedLogo },
  { id: 'car-volkswagen', name: 'Volkswagen', logoUrl: volkswagenLogo },
  { id: 'car-zotye', name: 'ZOTYE', logoUrl: zotyeLogo },
  { id: 'car-others', name: 'Other Brands', logoUrl: otherBrandsLogo }
];

const REGISTRATION_CITIES = [
  'Unregistered',
  'Abbottabad',
  'Ahmadpur East',
  'Ali Masjid',
  'Arifwala',
  'Askoley',
  'Attock',
  'Badin',
  'Bagh',
  'Bahawalnagar',
  'Bahawalpur',
  'Bannu',
  'Batagram',
  'Bela',
  'Bhakkar',
  'Bhimber',
  'Buner',
  'Burewala',
  'Charsadda',
  'Chichawatni',
  'Chilas',
  'Chiniot',
  'Chishtian Mandi',
  'Chitral',
  'Dadu',
  'Darra Adam Khel',
  'Daska',
  'Dera Ghazi Khan',
  'Dera Ismail Khan',
  'Faisalabad',
  'Ghanche',
  'Ghizer',
  'Gilgit',
  'Gojra',
  'Gujranwala',
  'Gujrat',
  'Gwadar',
  'Hafizabad',
  'Hala',
  'Hangu',
  'Haripur',
  'Hasilpur',
  'Haveli lakha',
  'Hyderabad',
  'Islamabad',
  'Jacobabad',
  'Jamrud',
  'Jamshoro',
  'Jandola',
  'Jaranwala',
  'Jhang Sadar',
  'Jhelum',
  'Jiwani',
  'Kalat',
  'Kamoke',
  'Kandhura',
  'Karachi',
  'Karak',
  'Kasur',
  'Khairpur',
  'Khanewal',
  'Khanpur',
  'Khaplu',
  'Khushab',
  'Khuzdar',
  'Kohat',
  'Kohistan',
  'Kot Addu',
  'Lahore',
  'Lakki Marwat',
  'Landi Kotal',
  'Larkana',
  'Lasbela',
  'Layyah',
  'Lower Dir',
  'Malakand',
  'Mandi Bahauddin',
  'Mansehra',
  'Mardan',
  'Mianwali',
  'Mingaora',
  'Miram Shah',
  'Mirpur',
  'Mirpur Khas',
  'Mithi',
  'Multan',
  'Muridike',
  'Muzaffarabad',
  'Muzaffargarh',
  'Nawabshah',
  'Nowshera',
  'Okara',
  'Ormara',
  'Pakpattan',
  'Parachinar',
  'Pasni',
  'Peshawar',
  'Pirmahal',
  'Punjab',
  'Quetta',
  'Rahimyar Khan',
  'Ratodero',
  'Rawalpindi',
  'Sadiqabad',
  'Safdar Abad',
  'Sahiwal',
  'Sargodha',
  'Shangla',
  'Sheikhüpura',
  'Shikarpur',
  'Sialkot',
  'Sindh',
  'Skardu',
  'Sukkar',
  'Sukkur',
  'Swabi',
  'Swat',
  'Tando Adam',
  'Tank',
  'Thatta',
  'Toba Tek singh',
  'Torkham',
  'Upper Dir',
  'Vehari',
  'Wah',
  'Wana',
  'Wazirabad'
];

const CAR_COLORS = [
  'Black',
  'Blue',
  'Brown',
  'Burgundy',
  'Gold',
  'Green',
  'Grey',
  'Orange',
  'Purple',
  'Red',
  'Silver',
  'White',
  'Yellow',
  'Beige',
  'Other'
];

const CAR_BODY_TYPES = [
  'Convertible',
  'Estate',
  'Hatchback',
  'MPV',
  'Pickup',
  'Sedan',
  'Small city car',
  'Sports / Coupe',
  'SUV',
  'Van / Bus',
  'Other'
];

const CAR_FUELS = [
  'Petrol',
  'Diesel',
  'LPG',
  'CNG',
  'Hybrid',
  'Electric',
  'REEV',
  'PHEV'
];

// This is the brand list that should be used for Monitors
const STATIC_MONITOR_BRANDS = [
  { id: 'mon-acer-id', name: 'Acer' },
  { id: 'mon-apple-id', name: 'Apple' },
  { id: 'mon-asus-id', name: 'Asus' },
  { id: 'mon-dell-id', name: 'Dell' },
  { id: 'mon-ease-id', name: 'EASE' },
  { id: 'mon-hp-id', name: 'HP' },
  { id: 'mon-intel-id', name: 'Intel' },
  { id: 'mon-lenovo-id', name: 'Lenovo' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Cameras
const STATIC_CAMERA_BRANDS = [
  { id: 'cam-arri', name: 'ARRI' },
  { id: 'cam-birddog', name: 'BirdDog' },
  { id: 'cam-blackmagic', name: 'Blackmagic' },
  { id: 'cam-canon', name: 'Canon' },
  { id: 'cam-dji', name: 'DJI' },
  { id: 'cam-fujifilm', name: 'Fujifilm' },
  { id: 'cam-gopro', name: 'GoPro' },
  { id: 'cam-hasselblad', name: 'Hasselblad' },
  { id: 'cam-insta360', name: 'Insta360' },
  { id: 'cam-lumix', name: 'Lumix' },
  { id: 'cam-newtek', name: 'NewTek' },
  { id: 'cam-nikon', name: 'Nikon' },
  { id: 'cam-olympus', name: 'Olympus' },
  { id: 'cam-panasonic', name: 'Panasonic' },
  { id: 'cam-red', name: 'RED RAVEN' },
  { id: 'cam-sigma', name: 'Sigma' },
  { id: 'cam-sjcam', name: 'SJCAM' },
  { id: 'cam-sony', name: 'Sony' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the type list that should be used for Digital Cameras
const STATIC_CAMERA_TYPES = [
  { id: 'cam-type-dslr', name: 'DSLR' },
  { id: 'cam-type-instant', name: 'Instant Cameras' },
  { id: 'cam-type-mirrorless', name: 'Mirrorless Cameras' },
  { id: 'cam-type-other', name: 'Other Cameras' },
  { id: 'cam-type-sports', name: 'Sports & Action Cameras' },
  { id: 'manual-add-type', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Tripods & Stands
const STATIC_TRIPOD_BRANDS = [
  { id: 'tri-apkina', name: 'Apkina' },
  { id: 'tri-beike', name: 'BEIKE' },
  { id: 'tri-benro', name: 'Benro' },
  { id: 'tri-cartoni', name: 'Cartoni' },
  { id: 'tri-coman', name: 'Coman' },
  { id: 'tri-dji', name: 'DJI' },
  { id: 'tri-godox', name: 'Godox' },
  { id: 'tri-gopro', name: 'GoPro' },
  { id: 'tri-gorilla', name: 'Gorilla' },
  { id: 'tri-icon', name: 'Icon' },
  { id: 'tri-icon-plus', name: 'Icon Plus' },
  { id: 'tri-ifootage', name: 'iFootage' },
  { id: 'tri-insta360', name: 'Insta360' },
  { id: 'tri-jmary', name: 'Jmary' },
  { id: 'tri-joby', name: 'JOBY' },
  { id: 'tri-kingjoy', name: 'Kingjoy' },
  { id: 'tri-libec', name: 'Libec' },
  { id: 'tri-manfrotto', name: 'Manfrotto' },
  { id: 'tri-mavic', name: 'Mavic' },
  { id: 'tri-neepho', name: 'NeePho' },
  { id: 'tri-photo-yunteng', name: 'Photo Yunteng' },
  { id: 'tri-remax', name: 'Remax' },
  { id: 'tri-riva', name: 'Riva' },
  { id: 'tri-rode', name: 'Rode' },
  { id: 'tri-sennheiser', name: 'Sennheiser' },
  { id: 'tri-somita', name: 'Somita' },
  { id: 'tri-telesin', name: 'Telesin' },
  { id: 'tri-ulanzi', name: 'Ulanzi' },
  { id: 'tri-victory', name: 'Victory' },
  { id: 'tri-weifeng', name: 'Weifeng' },
  { id: 'tri-yunteng', name: 'Yunteng' },
];

// This is the brand list that should be used for Video Lights
const STATIC_VIDEOLIGHT_BRANDS = [
  { id: 'vl-amaran', name: 'Amaran' },
  { id: 'vl-andoer', name: 'Andoer' },
  { id: 'vl-aputure', name: 'Aputure' },
  { id: 'vl-godox', name: 'Godox' },
  { id: 'vl-jmary', name: 'Jmary' },
  { id: 'vl-lensgo', name: 'LensGo' },
  { id: 'vl-mamen', name: 'Mamen' },
  { id: 'vl-manbily', name: 'Manbily' },
  { id: 'vl-manfrotto', name: 'Manfrotto' },
  { id: 'vl-meike', name: 'Meike' },
  { id: 'vl-nanlite', name: 'Nanlite' },
  { id: 'vl-neewer', name: 'Neewer' },
  { id: 'vl-sidande', name: 'Sidande' },
  { id: 'vl-vijim', name: 'VIJIM' },
  { id: 'vl-yidoblo', name: 'Yidoblo' },
  { id: 'vl-yongnuo', name: 'Yongnuo' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Video Cameras
const STATIC_VIDEOCAMERA_BRANDS = [
  { id: 'vc-canon', name: 'Canon' },
  { id: 'vc-hollyland', name: 'Hollyland' },
  { id: 'vc-jvc', name: 'JVC' },
  { id: 'vc-panasonic', name: 'Panasonic' },
  { id: 'vc-sony', name: 'Sony' },
  { id: 'vc-tilta', name: 'Tilta' },
  { id: 'vc-zoom', name: 'Zoom' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Camera Batteries
const STATIC_CAMERABATTERY_BRANDS = [
  { id: 'cb-anker', name: 'Anker' },
  { id: 'cb-aputure', name: 'Aputure' },
  { id: 'cb-blackmagic', name: 'Blackmagic' },
  { id: 'cb-camelion', name: 'Camelion' },
  { id: 'cb-canon', name: 'Canon' },
  { id: 'cb-core', name: 'Core' },
  { id: 'cb-dbk', name: 'DBK' },
  { id: 'cb-dji', name: 'DJI' },
  { id: 'cb-energizer', name: 'Energizer' },
  { id: 'cb-fujifilm', name: 'Fujifilm' },
  { id: 'cb-godox', name: 'Godox' },
  { id: 'cb-gopro', name: 'GoPro' },
  { id: 'cb-ifootage', name: 'iFootage' },
  { id: 'cb-insta360', name: 'Insta360' },
  { id: 'cb-kastar', name: 'Kastar' },
  { id: 'cb-kodak', name: 'Kodak' },
  { id: 'cb-mamen', name: 'Mamen' },
  { id: 'cb-meike', name: 'Meike' },
  { id: 'cb-nikon', name: 'Nikon' },
  { id: 'cb-panasonic', name: 'Panasonic' },
  { id: 'cb-powerplus', name: 'Power Plus' },
  { id: 'cb-rolux', name: 'ROLUX' },
  { id: 'cb-samson', name: 'Samson' },
  { id: 'cb-sjcam', name: 'SJCAM' },
  { id: 'cb-sony', name: 'Sony' },
  { id: 'cb-telesin', name: 'Telesin' },
  { id: 'cb-tilta', name: 'Tilta' },
  { id: 'cb-toshiba', name: 'Toshiba' },
  { id: 'cb-uniross', name: 'UNIROSS' },
  { id: 'cb-varta', name: 'Varta' },
  { id: 'cb-wbm', name: 'WBM' },
  { id: 'cb-wondlan', name: 'Wondlan' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for CCTV Cameras
const STATIC_CCTV_BRANDS = [
  { id: 'cctv-anker', name: 'Anker' },
  { id: 'cctv-arlo', name: 'Arlo' },
  { id: 'cctv-axis', name: 'Axis Communications' },
  { id: 'cctv-baseus', name: 'Baseus' },
  { id: 'cctv-blink', name: 'Blink' },
  { id: 'cctv-bosch', name: 'Bosch Smart Home' },
  { id: 'cctv-cpplus', name: 'CP-Plus' },
  { id: 'cctv-dlink', name: 'D-Link' },
  { id: 'cctv-dahua', name: 'Dahua Technology Ltd.' },
  { id: 'cctv-eufy', name: 'eufy' },
  { id: 'cctv-eve', name: 'Eve' },
  { id: 'cctv-ezviz', name: 'EZVIZ' },
  { id: 'cctv-google', name: 'Google' },
  { id: 'cctv-hikvision', name: 'Hikvision' },
  { id: 'cctv-imou', name: 'Imou' },
  { id: 'cctv-iris', name: 'Iris' },
  { id: 'cctv-logitech', name: 'Logitech' },
  { id: 'cctv-motorola', name: 'Motorola' },
  { id: 'cctv-nest', name: 'Nest' },
  { id: 'cctv-netatmo', name: 'Netatmo' },
  { id: 'cctv-nexia', name: 'Nexia' },
  { id: 'cctv-orient', name: 'Orient' },
  { id: 'cctv-pollo', name: 'Pollo' },
  { id: 'cctv-remoplus', name: 'Remoplus' },
  { id: 'cctv-ring', name: 'Ring' },
  { id: 'cctv-samsung', name: 'Samsung' },
  { id: 'cctv-synology', name: 'Synology' },
  { id: 'cctv-tend', name: 'Tend Insights' },
  { id: 'cctv-tplink', name: 'TP-Link' },
  { id: 'cctv-vera', name: 'Vera' },
  { id: 'cctv-wyze', name: 'wyze' },
  { id: 'cctv-wyzelabs', name: 'Wyze Labs' },
  { id: 'cctv-xiaomi', name: 'Xiaomi' },
  { id: 'cctv-zipato', name: 'Zipato' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Gimbles & Stablizers
const STATIC_GIMBAL_BRANDS = [
  { id: 'g-dji', name: 'DJI' },
  { id: 'g-feiyutech', name: 'Feiyu Tech' },
  { id: 'g-gopro', name: 'GoPro' },
  { id: 'g-hohem', name: 'Hohem' },
  { id: 'g-insta360', name: 'Insta360' },
  { id: 'g-moza', name: 'Moza' },
  { id: 'g-nicama', name: 'Nicama' },
  { id: 'g-telesin', name: 'TELESIN' },
  { id: 'g-wondlan', name: 'Wondlan' },
  { id: 'g-zhiyuntech', name: 'Zhiyun Tech' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the brand list that should be used for Drones
const STATIC_DRONE_BRANDS = [
  { id: 'dr-d6', name: 'D6 Drone' },
  { id: 'dr-dji', name: 'DJI' },
  { id: 'dr-holystone', name: 'Holy Stone' },
  { id: 'dr-planetx', name: 'Planet X' },
  { id: 'dr-w4hw', name: 'W4HW' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// Static models mapping for each brand
// This is the brand list that should be used for Camera & Lenses Accessories
const STATIC_CAMERA_ACC_BRANDS = [
  { id: 'ca-afi', name: 'AFI' },
  { id: 'ca-angelbird', name: 'AngelBird' },
  { id: 'ca-anker', name: 'Anker' },
  { id: 'ca-apkina', name: 'Apkina' },
  { id: 'ca-apple', name: 'Apple' },
  { id: 'ca-aputure', name: 'Aputure' },
  { id: 'ca-arri', name: 'Arri' },
  { id: 'ca-astera', name: 'Astera' },
  { id: 'ca-atomos', name: 'atomos' },
  { id: 'ca-bplusw', name: 'B plus W' },
  { id: 'ca-bediro', name: 'Bediro' },
  { id: 'ca-behringer', name: 'Behringer' },
  { id: 'ca-beike', name: 'Beike' },
  { id: 'ca-benro', name: 'Benro' },
  { id: 'ca-blackmagic', name: 'Blackmagic' },
  { id: 'ca-bower', name: 'Bower' },
  { id: 'ca-boya', name: 'Boya' },
  { id: 'ca-camelion', name: 'Camelion' },
  { id: 'ca-canon', name: 'Canon' },
  { id: 'ca-cartoni', name: 'Cartoni' },
  { id: 'ca-casim', name: 'Casim' },
  { id: 'ca-core', name: 'Core' },
  { id: 'ca-dbk', name: 'DBK' },
  { id: 'ca-deep', name: 'Deep' },
  { id: 'ca-dji', name: 'DJI' },
  { id: 'ca-dzofilm', name: 'DZOFILM' },
  { id: 'ca-easycover', name: 'Easy Cover' },
  { id: 'ca-falcon', name: 'Falcon' },
  { id: 'ca-fbtech', name: 'FBTech' },
  { id: 'ca-feelworld', name: 'FeelWorld' },
  { id: 'ca-feiyu', name: 'Feiyu' },
  { id: 'ca-freeworld', name: 'freeworld' },
  { id: 'ca-fujifilm', name: 'Fujifilm' },
  { id: 'ca-godox', name: 'Godox' },
  { id: 'ca-gopro', name: 'GoPro' },
  { id: 'ca-gosmart', name: 'Gosmart' },
  { id: 'ca-hohem', name: 'Hohem' },
  { id: 'ca-hollyland', name: 'Hollyland' },
  { id: 'ca-ifootage', name: 'iFootage' },
  { id: 'ca-insta360', name: 'Insta360' },
  { id: 'ca-jinbei', name: 'Jinbei' },
  { id: 'ca-jmary', name: 'JMary' },
  { id: 'ca-joby', name: 'Joby' },
  { id: 'ca-jsl', name: 'JSL' },
  { id: 'ca-kandf', name: 'KandF' },
  { id: 'ca-kastar', name: 'Kastar' },
  { id: 'ca-kf', name: 'KF' },
  { id: 'ca-kingjoy', name: 'Kingjoy' },
  { id: 'ca-kingston', name: 'Kingston' },
  { id: 'ca-kodak', name: 'Kodak' },
  { id: 'ca-krisyo', name: 'Krisyo' },
  { id: 'ca-kupo', name: 'Kupo' },
  { id: 'ca-lensgo', name: 'Lensgo' },
  { id: 'ca-lexar', name: 'Lexar' },
  { id: 'ca-libec', name: 'Libec' },
  { id: 'ca-life', name: 'Life' },
  { id: 'ca-lowepro', name: 'Lowepro' },
  { id: 'ca-lulliput', name: 'Lulliput' },
  { id: 'ca-lynca', name: 'Lynca' },
  { id: 'ca-mafrotto', name: 'Mafrotto' },
  { id: 'ca-manfrotto', name: 'Manfrotto' },
  { id: 'ca-maono', name: 'Maono' },
  { id: 'ca-metabones', name: 'Metabones' },
  { id: 'ca-moza', name: 'Moza' },
  { id: 'ca-nanlite', name: 'Nanlite' },
  { id: 'ca-natgeo', name: 'National Geographic' },
  { id: 'ca-nicefoto', name: 'NiceFoto' },
  { id: 'ca-nikon', name: 'Nikon' },
  { id: 'ca-olympus', name: 'Olympus' },
  { id: 'ca-panasonic', name: 'Panasonic' },
  { id: 'ca-peakdesign', name: 'Peak Design' },
  { id: 'ca-pelican', name: 'Pelican' },
  { id: 'ca-phottix', name: 'Phottix' },
  { id: 'ca-pixco', name: 'Pixco' },
  { id: 'ca-pixel', name: 'Pixel' },
  { id: 'ca-profoto', name: 'Profoto' },
  { id: 'ca-prograde', name: 'ProGrade' },
  { id: 'ca-quechua', name: 'Quechua' },
  { id: 'ca-redraven', name: 'Red Raven' },
  { id: 'ca-rode', name: 'Rode' },
  { id: 'ca-rolux', name: 'ROLUX' },
  { id: 'ca-samson', name: 'Samson' },
  { id: 'ca-samsung', name: 'Samsung' },
  { id: 'ca-samyang', name: 'Samyang' },
  { id: 'ca-sandisk', name: 'SanDisk' },
  { id: 'ca-saramonic', name: 'Saramonic' },
  { id: 'ca-savage', name: 'Savage' },
  { id: 'ca-sennheiser', name: 'Sennheiser' },
  { id: 'ca-sevenoak', name: 'Sevenoak' },
  { id: 'ca-shanny', name: 'Shanny' },
  { id: 'ca-shure', name: 'Shure' },
  { id: 'ca-sidande', name: 'Sidande' },
  { id: 'ca-sigma', name: 'Sigma' },
  { id: 'ca-sjcam', name: 'SJCAM' },
  { id: 'ca-smallrig', name: 'SmallRig' },
  { id: 'ca-somita', name: 'Somita' },
  { id: 'ca-sony', name: 'Sony' },
  { id: 'ca-sovo', name: 'Sovo' },
  { id: 'ca-spiderfire', name: 'Spider Fire' },
  { id: 'ca-superzenith', name: 'Super Zenith' },
  { id: 'ca-synco', name: 'Synco' },
  { id: 'ca-tamrac', name: 'Tamrac' },
  { id: 'ca-tamron', name: 'Tamron' },
  { id: 'ca-telesin', name: 'Telesin' },
  { id: 'ca-tilta', name: 'Tilta' },
  { id: 'ca-toughpak', name: 'Tough In Pakistan' },
  { id: 'ca-tubu', name: 'TUBU' },
  { id: 'ca-ugreen', name: 'UGREEN' },
  { id: 'ca-ulanzi', name: 'Ulanzi' },
  { id: 'ca-ustine', name: 'Ustine' },
  { id: 'ca-varta', name: 'Varta' },
  { id: 'ca-vijim', name: 'Vijim' },
  { id: 'ca-viltrox', name: 'Viltrox' },
  { id: 'ca-vsgo', name: 'VSGO' },
  { id: 'ca-weifeng', name: 'Weifeng' },
  { id: 'ca-wise', name: 'Wise' },
  { id: 'ca-wondlan', name: 'Wondlan' },
  { id: 'ca-xiaomi', name: 'Xiaomi' },
  { id: 'ca-yololiv', name: 'Yololiv' },
  { id: 'ca-yongnuo', name: 'Yongnuo' },
  { id: 'ca-yunteng', name: 'YUNTENG' },
  { id: 'ca-zhiyun', name: 'Zhiyun Tech' },
  { id: 'ca-zoom', name: 'Zoom' },
  { id: 'manual-add-brand', name: '➕ Add Manually' }
];

// This is the type list that should be used for Camera & Lenses Accessories
const STATIC_CAMERA_ACC_TYPES = [
  { id: 'cat-chargers', name: 'Battery Chargers' },
  { id: 'cat-cleaning', name: 'Camera Cleaning Kits & Tools' },
  { id: 'cat-repair', name: 'Camera Repair & Spare Parts' },
  { id: 'cat-protectors', name: 'Camera Screen Protectors' },
  { id: 'cat-straps', name: 'Camera Straps' },
  { id: 'cat-dryboxes', name: 'Dry Boxes' },
  { id: 'cat-instant', name: 'Instant Cameras' },
  { id: 'cat-lensacc', name: 'Lens Accessories' },
  { id: 'cat-lensclean', name: 'Lens Cleaners' },
  { id: 'cat-studio', name: 'Lighting & Studio Equipment' },
  { id: 'cat-memory', name: 'Memory Cards & Card Readers' },
  { id: 'manual-add-type', name: '➕ Add Manually' }
];

// This is the type list that should be used for Chargers
const STATIC_CHARGER_TYPES = [
  { id: 'ch-ios', name: 'IOS' },
  { id: 'ch-microusb', name: 'Micro-USB/Android' },
  { id: 'ch-typec', name: 'USB Type-C' },
  { id: 'ch-wireless', name: 'Wireless' },
  { id: 'ch-carcharger', name: 'Car Charger' },
  { id: 'ch-others', name: 'Others' },
  { id: 'manual-add-type', name: '➕ Add Manually' }
];

// This is the type list that should be used for Charging Cables
const STATIC_CABLE_TYPES = [
  { id: 'ca-ios', name: 'IOS' },
  { id: 'ca-microusb', name: 'Micro-USB/Android' },
  { id: 'ca-typec', name: 'USB Type-C' },
  { id: 'ca-others', name: 'Others' },
  { id: 'manual-add-type', name: '➕ Add Manually' }
];

const STATIC_MODELS: Record<string, string[]> = {
  // Mobile models
  'apple-id': ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
  'samsung-id': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy Z Fold 5', 'Galaxy A54 5G', 'Galaxy A55', 'Galaxy A35', 'Galaxy S23 FE'],
  'google-id': ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6 Pro', 'Pixel 6a'],
  'xiaomi-id': ['Redmi Note 13 Pro', 'Xiaomi 14 Ultra', 'Xiaomi 13T', 'Redmi 12', 'Xiaomi 13 Pro'],
  'oneplus-id': ['OnePlus 12', 'OnePlus 11', 'OnePlus Nord 3', 'OnePlus Open'],
  'oppo-id': ['Reno 11 Pro', 'F25 Pro', 'Find X7 Ultra', 'Reno 11'],
  'vivo-id': ['V30 Pro', 'Y200', 'X100 Pro', 'V29'],
  'infinix-id': ['Note 40 Pro', 'Hot 40', 'Zero 30'],
  'tecno-id': ['Camon 30 Pro', 'Spark 20', 'Phantom X2'],
  'realme-id': ['GT 5G', '12 Pro+', 'C67', 'Narzo 60'],
  'motorola-id': ['Moto G84', 'Moto G54', 'Moto Edge 40', 'Moto Razr 40'],
  'nokia-id': ['G42', 'C22', 'X30', 'G21'],
  'huawei-id': ['P60 Pro', 'Mate 50 Pro', 'Nova 11', 'P40'],
  'honor-id': ['Magic 5 Pro', '90', 'X9a', 'Magic V2'],
  'sony-id': ['Xperia 1 V', 'Xperia 5 V', 'Xperia 10 V'],
  'lg-id': ['Wing', 'Velvet', 'V60 ThinQ'],
  'itel-id': ['A70', 'S23+', 'Vision 3'],
  'zte-id': ['Axon 50', 'Blade A72', 'Nubia Z60'],
  'htc-id': ['U23 Pro', 'Desire 22', 'Wildfire E3'],
  'lenovo-id': ['Legion Y90', 'ThinkPhone', 'K14'],
  'asus-id': ['ROG Phone 7', 'Zenfone 10', 'ROG Phone 6'],
  'blackberry-id': ['Key2', 'KeyOne'],
  'tcl-id': ['30', '20 Pro 5G', '40 XE'],
  'microsoft-id': ['Surface Duo 2', 'Surface Duo'],
  'panasonic-id': ['Tough G5', 'Eluga I9'],
  'acer-id': ['Liquid Z6', 'Predator 6'],
  'meizu-id': ['21', '20', '18s'],
  'gionee-id': ['F205 Pro', 'A1 Lite'],
  'lava-id': ['Blaze 2', 'Agni 2', 'Z6'],
  'hisense-id': ['Infinity H50', 'A5'],
  'nothing-id': ['Phone 2', 'Phone 1', 'CMF Phone 1'],
  'hmd-id': ['Pulse Pro', 'Skyline', 'T21'],
  'philips-id': ['Xenium S650', 'E6810'],
  'sharp-id': ['Aquos R8', 'Sense 8'],
  'razer-id': ['Phone 2', 'Phone 1'],
  't-mobile-id': ['Revvl 6 Pro', 'Revvl 5G'],
  'fairphone-id': ['5', '4'],
  'cubot-id': ['King Kong Star', 'X70'],
  'doogee-id': ['V Max', 'S100'],
  'ulefone-id': ['Armor 23 Ultra', 'Note 17 Pro'],
  'umidigi-id': ['A15', 'G5', 'C1'],
  'blackview-id': ['BV9800 Pro', 'A80', 'Oscal S80'],
  'coolpad-id': ['Active', 'Cool 10'],
  'cat-id': ['S62 Pro', 'S52'],
  'kyocera-id': ['DuraForce Ultra', 'Torque G05'],
  'spice-id': ['M-6480', 'F311'],
  'sparx-id': ['Neo 7', 'Ultra 11'],
  'qmobile-id': ['Noir A9', 'E2', 'X8'],
  'calme-id': ['C5', 'C6'],
  'club-id': ['C510', 'C500'],
  'mobilink-jazzx-id': ['JazzX 2', 'JazzX Pro'],
  'gfive-id': ['G9', 'A98'],
  'haier-id': ['G7', 'E50'],
  'voice-id': ['V2', 'V3'],
  'rivo-id': ['R50', 'R60'],
  'g-tide-id': ['GT20', 'GT10'],
  'gright-id': ['G3', 'G5'],
  'innjoo-id': ['H2', 'H5'],
  'oscal-id': ['Pilot 2', 'C80'],
  'oukitel-id': ['C50', 'WP38'],
  'villaon-id': ['V100', 'V200'],
  'wiko-id': ['View 5', 'T50'],
  'xmobile-id': ['X20', 'X30'],
  'xsmart-id': ['XS1', 'XS2'],
  'allcall-id': ['Atom', 'S1'],
  'blu-id': ['G93', 'F91', 'C5L'],
  'archos-id': ['Oxygen 103', 'T83'],
  'dcode-id': ['D10', 'D20'],
  'energizer-id': ['Energy E20', 'Hardcase H550'],
  'e-tachi-id': ['ET-1', 'ET-2'],
  'faywa-id': ['F1', 'F2'],
  'gresso-id': ['G1', 'G2'],
  'inew-id': ['V3', 'V5'],
  'kxd-id': ['K1', 'K2'],
  'me-mobile-id': ['ME1', 'ME2'],
  'sego-id': ['S1', 'S2'],
  'sonim-id': ['XP8', 'XP10'],
  'vgo-tel-id': ['V1', 'V2'],
  'vnus-id': ['V1', 'V2'],
  'xtouch-id': ['X1', 'X2'],
  'alcatel-id': ['3L', '1S', '7'],
  'sony-ericsson-id': ['Xperia Mini', 'Xperia Play', 'Xperia Arc'],
  'other-id': ['Other Model'],

  // Tablet models
  'tab-apple-id': ['iPad Pro', 'iPad Air', 'iPad mini', 'iPad (10th gen)', 'iPad (9th gen)', 'iPad Pro 12.9', 'iPad Pro 11'],
  'tab-samsung-id': ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9', 'Galaxy Tab S9 FE', 'Galaxy Tab A9+', 'Galaxy Tab A9', 'Galaxy Tab S8 Ultra', 'Galaxy Tab S7'],
  'tab-lenovo-id': ['Tab P12', 'Tab M10 Plus', 'Tab P11 Pro', 'Yoga Tab 11', 'Tab M8'],
  'tab-amazon-id': ['Fire HD 10', 'Fire HD 8', 'Fire 7', 'Fire Max 11'],
  'tab-huawei-id': ['MatePad Pro', 'MatePad 11.5', 'MatePad SE', 'MatePad T10'],
  'tab-dany-id': ['Signature S8', 'Monster 4G', 'Genius G5', 'Rex 7'],
  'tab-qtabs-id': ['QTab V100', 'QTab V200', 'QTab V10'],
  'tab-huion-id': ['Kamvas Pro 16', 'Kamvas 13', 'Inspiroy H640P', 'Kamvas 22'],
  'tab-wacom-id': ['Cintiq 16', 'Intuos Pro', 'One by Wacom', 'Wacom Intuos'],
  'tab-other-id': ['Other Tablet Model'],

  // Console models
  'con-acer-id': ['Predator Orion', 'Nitro 50', 'Predator Cestus'],
  'con-alienware-id': ['Aurora R16', 'Aurora R15', 'Alienware Alpha'],
  'con-aorus-id': ['Aorus Model S', 'Aorus Model X'],
  'con-corsair-id': ['Corsair One', 'Vengeance i7400'],
  'con-lenovo-id': ['Legion Tower 7i', 'Legion Tower 5i', 'IdeaCentre Gaming'],
  'con-msi-id': ['Infinite X', 'Trident 3', 'Aegis RS'],
  'con-omen-id': ['HP Omen 45L', 'HP Omen 25L', 'Omen Obelisk'],
  'con-razer-id': ['Razer Blade Gaming', 'Razer Tomahawk'],
  'con-rog-id': ['ROG Strix G16CH', 'ROG Strix G13CH', 'ROG Ally'],
  'con-zotac-id': ['Zbox Magnus', 'Zbox Mek'],
  'con-others-id': ['Other Console / Gaming PC'],

  // Car models
  'car-suzuki': ['Alto', 'Mehran VXR', 'Cultus VXR', 'Mehran VX', 'Wagon R', 'Bolan', 'Swift', 'Mehran', 'Cultus VXL', 'Khyber', 'Every', 'Baleno', 'Liana', 'Cultus', 'FX', 'Margalla', 'Ravi', 'Cultus VX', 'Every Wagon', 'Hustler', 'Carry', 'Wagon R Stingray', 'APV', 'Jimny', 'Potohar', 'Alto Lapin', 'Kei', 'Spacia', 'Ciaz', 'MR Wagon', 'Vitara', 'Cervo', 'Jimny Sierra', 'Sj410', 'Xbee', 'Sx4', 'Mega Carry Xtra', 'Palette', 'Solio', 'Kizashi', 'Celerio', 'Cappuccino', 'Escudo', 'Palette Sw', 'Samuari', 'Solio Bandit', 'Ignis', 'Lj80', 'Twin', 'Fronx', 'Others'],
  'car-toyota': ['Corolla GLI', 'Corolla XLI', 'Vitz', 'Corolla Altis', 'Yaris', 'Corolla', 'Passo', 'Prius', 'Aqua', 'Altis Grande', 'Raize', 'Corolla XE', 'Hilux', 'Prado', 'Corolla 2.0 D', 'Land Cruiser', '86', 'C-HR', 'Corolla Axio', 'Premio', 'Surf', 'Belta', 'Platz', 'Pixis Epoch', 'Corolla Cross HEV X', 'Fortuner Sigma', 'Corolla Fielder', 'Fortuner', 'Sienta', 'Fortuner V', 'Corona', 'Hiace', 'Crown', 'Mark X', 'Prius Alpha', 'Starlet', 'Roomy', 'Camry', 'Rush', 'Duet', 'Fielder', 'Probox', 'Fortuner Legender', 'Mark II', 'Corolla Assista', 'Fortuner G', 'Allion', 'Harrier', 'Rav4', 'Town Ace', 'Avanza', 'Voxy', 'Aygo', 'IST', 'Pickup', 'Corolla Cross', 'Corolla Cross HEV', 'Alphard Hybrid', 'Cressida', 'Estima', 'Fj Cruiser', 'Sprinter', 'Carina', 'iQ', 'Lucida', 'Noah', 'Porte', 'Succeed', 'Wish', 'Alphard', 'Ractis', 'Tundra', 'Van', 'Avensis', 'B B', 'Cami', 'Celica', 'Esquire', 'ISIS', 'Lite Ace', 'Coaster', 'Raum', 'Sera', 'Auris', 'Tacoma', 'Toyo Ace', 'Vanguard', 'Verossa', 'Chaser', 'Cresta', 'Echo', 'Kluger', 'MR2', 'Previa', 'Spacio', 'Supra', 'Urban Cruiser', 'Pixis Joy', 'Tank', 'Others'],
  'car-honda': ['City IVTEC', 'Civic VTi Oriel Prosmatec', 'Civic EXi', 'City', 'City IDSI', 'Civic Prosmetic', 'Civic Oriel', 'Civic', 'Vezel', 'City Aspire', 'Civic VTi', 'BR-V', 'Civic VTi Oriel', 'Accord', 'N Wgn', 'Fit', 'City Vario', 'N One', 'Civic RS', 'Civic Turbo 1.5', 'Civic Standard', 'Freed', 'N Box Custom', 'N Box', 'Life', 'Civic Hybrid', 'Acty', 'Insight', 'Airwave', 'Grace Hybrid', 'HR-V VTI-S', 'CR-Z', 'HR-V', 'Spike', 'Vamos', 'Zest', 'Cross Road', 'Jade Hybrid', 'HR-V VTI', 'CR-V', 'S660', 'Fit Aria', 'N Box Plus', 'Zest Spark', 'CR-Z Sports Hybrid', 'Stream', 'N Box Slash', 'Accord Tourer', 'Acura', 'Beat', 'Thats', 'Integra', 'N Van', 'Others'],
  'car-daihatsu': ['Cuore', 'Mira', 'Charade', 'Move', 'Hijet', 'Rocky', 'Taft', 'Terios Kid', 'Tanto', 'Cast', 'Atrai Wagon', 'Boon', 'Esse', 'Copen', 'Mira Cocoa', 'Charmant', 'Wake', 'Sonica', 'Feroza', 'Gran', 'Sirion', 'Bego', 'Opti', 'Bezza', 'Others'],
  'car-nissan': ['Sunny', 'Dayz', 'Clipper', 'Dayz Highway Star', 'Note E Power', 'Moco', 'Juke', 'Roox', 'AD Van', 'March', 'Otti', 'Kicks', 'Note', 'Wingroad', 'Tiida', 'Sakura', 'Navara', 'Leaf', 'Pino', 'Kix', 'Patrol', 'Serena', '120 Y', 'Caravan', 'X Trail', 'Bluebird Sylphy', 'Pickup', 'Safari', 'Ariya B6', 'Pulsar', 'Blue Bird', 'Infinity', 'Qashqai', 'Vanette', '350Z', 'Figaro', 'GT-R', 'Murrano', 'President', 'Sylphy', 'Titan', 'Z Series', 'Ariya B9', 'Others'],
  'car-adam': ['Revo', 'Zabardast', 'Boltro', 'Others'],
  'car-audi': ['A4', 'A3', 'A5', 'E-Tron', 'A6', 'Q3', 'Q7', 'E-tron Gt', 'A1', 'A7', 'A8', 'Q2', 'Q5', 'R8', 'Tt', 'Others'],
  'car-baic': ['BJ40', 'BJ40 Plus', 'Senova D20', 'M50', 'Senova X25', 'Others'],
  'car-bentley': ['Continental Gt', 'Continental', 'Others'],
  'car-bmw': ['5 Series', '3 Series', '7 Series', 'X1', 'iX', 'X5 Series', '8 Series', 'M Series', 'X3 Series', 'X4', 'i4', 'i5', '1 Series', '2 Series', '6 Series', 'Gt', 'i8', 'X6 Series', 'Z3', 'Z4', 'Z8', 'i3', '4 Series', 'X2', 'X7', 'Others'],
  'car-buick': ['Century', 'Lesabre', 'Regal', 'Others'],
  'car-byd': ['Atto 3 SR', 'Seal 06GT', 'Dolphin', 'Atto 2', 'Sealion 6', 'Sealion 7', 'YangWang U7', 'Atto 4', 'Han', 'Shark', 'Tang', 'Others'],
  'car-cadillac': ['Cts', 'Excalade Ext', 'Fleetwood', 'Others'],
  'car-changan': ['Karvaan', 'Alsvin', 'Oshan X7', 'M9', 'Gilgit', 'Kalam', 'Chitral', 'Kaghan', 'A800', 'M9 Sherpa', 'Kalash', 'Shahanshah', 'CX70T', 'Kaghan XL', 'M8', 'Others'],
  'car-chery': ['Tiggo 8 Pro', 'Tiggo 4 Pro', 'QQ', 'Tiggo 7 Pro', 'Others'],
  'car-chevrolet': ['Joy', 'Optra', 'Aveo', 'Cruze', 'Spark', 'Camaro', 'Others'],
  'car-chrysler': ['300C', 'Voyager', 'Grand Voyager', 'Others'],
  'car-classic-antiques': ['Classic Car', 'Antique Car', 'Vintage Car', 'Others'],
  'car-daewoo': ['Racer', 'Cielo', 'Nexia', 'Matiz', 'Super Saloon', 'Others'],
  'car-datsun': ['Go', 'Go+', 'Redi-Go', 'Sunny', 'Others'],
  'car-deepal': ['S07', 'L07', 'Others'],
  'car-dfsk': ['Glory 580', 'Glory 500', 'Glory i-Auto', 'Prince Pearl', 'H07', 'K01', 'Others'],
  'car-dodge': ['Charger', 'Challenger', 'Durango', 'Ram', 'Neon', 'Others'],
  'car-dongfeng': ['Fengon 580', 'Fengon 500', 'Aeolus Yixuan', 'Others'],
  'car-faw': ['V2', 'XPV', 'Carrier', 'Sirius', 'Others'],
  'car-fiat': ['Uno', 'Palio', '500', 'Punto', 'Tempra', 'Others'],
  'car-ford': ['Mustang', 'Ranger', 'Raptor', 'Focus', 'Fiesta', 'Explorer', 'F-150', 'Escape', 'Others'],
  'car-gmc': ['Yukon', 'Sierra', 'Acadia', 'Terrain', 'Others'],
  'car-gwm': ['Tank 500', 'Ora 03', 'Tank 300', 'Poer', 'Others'],
  'car-haval': ['H6', 'Jolion', 'H6 HEV', 'Jolion HEV', 'H9', 'Others'],
  'car-hino': ['Dutro', 'Profia', 'Ranger', 'Bus', 'Others'],
  'car-honri': ['Ve', 'Others'],
  'car-hummer': ['H2', 'H3', 'EV', 'Others'],
  'car-hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Staria', 'Accent', 'Grand Starex', 'Ioniq', 'Porter H100', 'Santro', 'Others'],
  'car-inverex': ['Solar Car', 'Electric Vehicle', 'Others'],
  'car-isuzu': ['D-Max', 'MU-X', 'N-Series', 'NPR', 'Others'],
  'car-jac': ['T6', 'T8', 'X200', 'J4', 'Others'],
  'car-jaecoo': ['J7', 'J8', 'Others'],
  'car-jaguar': ['XF', 'XJ', 'F-Type', 'F-Pace', 'E-Pace', 'Others'],
  'car-jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Gladiator', 'Renegade', 'Others'],
  'car-jetour': ['Dashing', 'X70 Plus', 'X90 Plus', 'Others'],
  'car-jw-forland': ['C19', 'Bravo', 'Alpha', 'Others'],
  'car-kia': ['Sportage', 'Picanto', 'Stonic', 'Sorento', 'Carnival', 'Spectra', 'Classic', 'Rio', 'Pride', 'Others'],
  'car-land-rover': ['Defender', 'Discovery', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar', 'Freelander', 'Others'],
  'car-lexus': ['RX Series', 'LX Series', 'IS Series', 'ES Series', 'LS Series', 'NX Series', 'GX Series', 'Others'],
  'car-mazda': ['Mazda 3', 'Mazda 6', 'MX-5 Miata', 'CX-5', 'CX-9', 'CX-30', 'RX-8', 'RX-7', 'Flair', 'Carol', 'Others'],
  'car-mercedes': ['C-Class', 'E-Class', 'S-Class', 'CLA', 'GLA', 'GLC', 'GLE', 'G-Class', 'A-Class', 'SL', 'Sprinter', 'Others'],
  'car-mg': ['HS', 'ZS', 'MG 5', 'MG 6', 'MG 3', 'MG 4 EV', 'ZS EV', 'HS PHEV', 'Cyberster', 'Others'],
  'car-mitsubishi': ['Lancer', 'Pajero', 'Mirage', 'Ek Wagon', 'Outlander', 'L200 Triton', 'Galant', 'Evolution', 'Pajero Mini', 'Others'],
  'car-mushtaq': ['Mushtaq Kyusha', 'Mushtaq Al-Haj', 'Others'],
  'car-peugeot': ['2008', '3008', '5008', '208', '308', 'Others'],
  'car-porsche': ['911', 'Cayenne', 'Panamera', 'Macan', 'Taycan', 'Boxster', 'Cayman', 'Others'],
  'car-prince': ['Pearl', 'DFSK K01', 'Prince DFSK C37', 'Others'],
  'car-proton': ['Saga', 'X70', 'X50', 'Persona', 'Exora', 'Others'],
  'car-range-rover': ['Sport', 'Vogue', 'Velar', 'Evoque', 'Defender', 'Others'],
  'car-renault': ['Duster', 'Kwid', 'Triber', 'Megane', 'Koleos', 'Captur', 'Others'],
  'car-seres': ['Seres 3', 'Seres 5', 'M7', 'Others'],
  'car-ssangyong': ['Korando', 'Rexton', 'Tivoli', 'Musso', 'Others'],
  'car-subaru': ['Impreza', 'WRX', 'Forester', 'Outback', 'XV Crosstrek', 'Legacy', 'BRZ', 'Others'],
  'car-tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Others'],
  'car-united': ['Alpha', 'Bravo', 'Usmaan', 'Others'],
  'car-volkswagen': ['Golf', 'Beetle', 'Passat', 'Polo', 'Tiguan', 'ID.4', 'ID.6', 'Touareg', 'Jetta', 'Others'],
  'car-zotye': ['Z100', 'T600', 'Nomad', 'Others'],
  'car-others': ['Other Vehicle Model'],

  // Truck models
  'truck-hino': ['Dutro', 'Ranger', 'Profia', '500 Series', '700 Series', 'Dutro Custom', 'Others'],
  'truck-isuzu': ['Elf', 'Forward', 'Giga', 'NHR', 'NPR', 'FTR', 'FVZ', 'C-Series', 'E-Series', 'Others'],
  'truck-master': ['Foton', 'Super Dumper', 'Forland', 'Foton Aumark', 'Master Star', 'Others'],
  'truck-daewoo': ['Novus', 'Prima', 'Maximus', 'Dumper', 'Cargo', 'Others'],
  'truck-yutong': ['Master', 'Bus Series', 'Coach', 'Electric Bus', 'Others'],
  'truck-faw': ['Carrier', 'J5', 'J6', 'Tiger', 'Tornado', 'X-PV', 'Others'],
  'truck-jmc': ['Vigus', 'Carrying', 'Boarding', 'Others'],
  'truck-jac': ['X200', 'Runner', 'Power', 'HFC', 'Others'],
  'truck-kamaz': ['43118', '5490', '65115', '6520', 'Others'],
  'truck-volvo': ['FH16', 'FM', 'FMX', 'FL', 'FE', 'Others'],
  'truck-scania': ['R-Series', 'G-Series', 'P-Series', 'S-Series', 'Others'],
  'truck-others': ['Other Truck Model'],

  // Rickshaw models
  'rick-sazgar': ['7-Seater', '9-Seater', 'Royal Passenger', 'EV Rickshaw', 'Cargo Loader', 'Others'],
  'rick-qingqi': ['Passenger Rickshaw', 'Cargo Loader', 'Qingqi 100cc', 'Qingqi 150cc', 'Others'],
  'rick-road-prince': ['Passenger Rickshaw', 'Cargo Loader 150cc', 'Road Prince 200cc', 'Others'],
  'rick-new-asia': ['Cargo Loader 150cc', 'Ramz Rickshaw', 'Passenger Rickshaw', 'Others'],
  'rick-united': ['United 100cc', 'Passenger Rickshaw', 'Loader 150cc', 'Others'],
  'rick-tez-raftar': ['Tez Raftar Passenger', 'Cargo Loader 150cc', 'Cargo Loader 200cc', 'Others'],
  'rick-crown': ['Crown Fit Passenger', 'Crown 150cc Loader', 'Others'],
  'rick-habib': ['Habib Passenger Rickshaw', 'Habib 150cc Loader', 'Others'],
  'rick-others': ['Other Rickshaw Model'],

  // Tractor models
  'trac-massey-ferguson': ['MF 240', 'MF 260', 'MF 375', 'MF 385', 'MF 385 4WD', 'MF 240 2WD', 'MF 350', 'Others'],
  'trac-fiat-alghazi': ['Fiat 480', 'Fiat 640', 'Fiat Ghazi', 'Fiat 480 Special', 'Fiat 640 Special', 'Others'],
  'trac-belarus': ['MTZ-50', 'MTZ-80', 'MTZ-82', 'Belarus 510', 'Belarus 520', 'Belarus 820', 'Others'],
  'trac-john-deere': ['JD 5050', 'JD 5055', 'JD 5075', 'JD 5310', 'Others'],
  'trac-ford': ['Ford 3000', 'Ford 3600', 'Ford 4000', 'Ford 4600', 'Ford 4610', 'Ford 5000', 'Others'],
  'trac-imt': ['IMT 539', 'IMT 542', 'IMT 560', 'IMT 577', 'Others'],
  'trac-ursus': ['Ursus C-330', 'Ursus C-355', 'Ursus C-360', 'Ursus C-385', 'Others'],
  'trac-others': ['Other Tractor Model'],

  // Standard Bike models
  'sb-honda': [
    'CG 125',
    'CD 70',
    'Pridor',
    'CB 150F',
    'CG 125 Special Edition',
    'CD 100',
    'CB 125F',
    'CD 70 Dream',
    'CB 125',
    'CG 125 Deluxe',
    'CG 125 Dream',
    'CD 200',
    'Deluxe',
    'Road Master',
    'CB 200',
    'CD 100 Euro 2',
    'CD 175',
    'CB 180',
    'CB 250F',
    'CB175',
    'CB 400',
    'CB 900F',
    'CB 1100',
    'CB 1000R',
    'CG 150',
    'Others'
  ],
  'sb-yamaha': [
    'YBR 125G',
    'YBR 125',
    'YB 125Z',
    'YB 125Z-DX',
    'Royale YB 100',
    'Dhoom YD-70',
    'YD-100 Junoon',
    '4 YD 100',
    'DX-100',
    'RX 115',
    'Mini 100 Euro II',
    'MT-09',
    'FZ1',
    'Others'
  ],
  'sb-suzuki': [
    'GS 150',
    'GD 110',
    'GS 150 SE',
    'GR 150',
    'GD 1105',
    'GS-125',
    'Sprinter',
    'GP 100',
    'Raider 110',
    'Shogun',
    'GS 500E',
    'Sprinter ECO',
    'Bandit',
    'Inazuma',
    'SV650',
    'Bandit 250VC',
    'Gladius',
    'GS500F',
    'GS750',
    'RG 125',
    'TU250X',
    'Bandit 1250S',
    'Bandit 1250S ABS',
    'Bandit 400VC',
    'GN 250',
    'GSF 400',
    'GSF 650',
    'SV650 ABS',
    'SV650SF',
    'SV650SF ABS',
    'Others'
  ],
  'sb-road-prince': ['RP 70 Passion', 'Wego 150', 'RP 110', 'RP 125 Euro II', 'Twister 125', 'Bullet', 'Robinson 150', 'Others'],
  'sb-united': ['US 70', 'US 125 Euro II', 'US 100', 'US 125 Deluxe', 'US 150 Ultimate', 'US 100 Jazba', 'Others'],
  'sb-unique': ['Xtreme UD 70', 'UD 125', 'UD 100', 'Crazer UD 150', 'Others'],
  'sb-super-power': ['SP 70', 'SP 125', 'Deluxe 70', 'SP 110 Cheetah', 'SP 100', 'SP 150 Archi', 'PK 150 Archi', 'SP 125 Delux', 'SP 70 Tokyo', 'Others'],
  'sb-crown': ['RF 70', 'CRLF 70', 'CR 70 HD Plus', 'CR 125 Euro II', 'CR 70 Self Start', 'CRLF 70cc Euro II', 'FIT 150 Fighter', 'CR 100 Excellence', 'CR 70 Jazba', 'CRLF Spoke Wheel', 'Others'],
  'sb-super-star': ['CD 70', '125cc', '100cc', 'Others'],
  'sb-union-star': ['70cc', '70 Deluxe', '125', 'Others'],
  'sb-hi-speed': ['CDI SR-70CC Euro-2', 'Others'],
  'sb-metro': ['MR 70', 'MR 125', 'Boom 70', 'Tez Raftar 70', 'MR 100', 'Dabang Euro II 70', 'Jeet 70', 'MR-70 Limited Edition', 'Others'],
  'sb-ravi': ['Humsafar 70', 'Piaggio Storm 125', 'Humsafar Plus', 'Premium R1', 'Others'],
  'sb-hero': ['RF 70', 'RF 125', 'Plus 90', 'Splander 100', 'Others'],
  'sb-kawasaki': ['GTO 125', 'GTO 100', 'GTO 110', 'Eliminator 125', 'GT 550', 'ER-6n', 'GTO 70', 'Others'],
  'sb-super-asia': ['SA 70', 'Others'],
  'sb-power': ['PK 70', 'PK Deluxe', 'PK 125', 'Others'],
  'sb-pak-hero': ['RF 70', 'PH 70', 'PK125', 'Others'],
  'sb-safari': ['Safari 70', 'Others'],
  'sb-benelli': ['TNT 150i', 'TNT 25', 'TNT 600', '180S', 'TRK 502', 'Others'],
  'sb-eagle': ['Eagle 70', 'Eagle 100', 'Others'],
  'sb-treet': ['Treet 70', 'Others'],
  'sb-ghani': ['Ghani 70', 'Ghani 100', 'Others'],
  'sb-habib': ['Habib 70', 'Habib 100', 'Others'],
  'sb-lifan': ['Lifan 150', 'Lifan 200', 'Others'],
  'sb-sohrab': ['Sohrab 70', 'Sohrab 100', 'Others'],
  'sb-derbi': ['Derbi 150', 'Others'],
  'sb-zongshen': ['Zongshen 150', 'Others'],
  'sb-qingqi': ['Qingqi 70', 'Qingqi 100', 'Others'],
  'sb-toyo': ['Toyo 70', 'Others'],
  'sb-cineco': ['Cineco 150', 'Others'],
  'sb-cf-moto': ['CF 150', 'CF 250', 'Others'],
  'sb-zxmco': ['Zxmco 70', 'Zxmco 100', 'Others'],
  'sb-others': ['Other Bike Model'],

  // Cruiser models
  'cr-harley': ['Iron 883', 'Forty-Eight', 'Street 750', 'Fat Boy', 'Fat Bob', 'Others'],
  'cr-honda': ['Shadow 400', 'Shadow 750', 'Rebel 300', 'Rebel 500', 'Steed 400', 'Others'],
  'cr-hi-speed': ['Infinity 150', 'Others'],
  'cr-suzuki': ['Intruder 150', 'Intruder 250', 'Boulevard', 'Others'],
  'cr-zongshen': ['Zongshen Cruiser', 'Others'],
  'cr-jonway': ['Jonway Cruiser', 'Others'],
  'cr-yamaha': ['DragStar 400', 'V-Star 250', 'Bolt', 'Others'],
  'cr-benelli': ['Motobi 200 Evo', '502C', 'Others'],
  'cr-kawasaki': ['Vulcan S', 'Vulcan 900', 'Eliminator 250', 'Others'],
  'cr-voge': ['Voge 300AC', 'Others'],
  'cr-others': ['Other Cruiser Model'],

  // Electric Bike models
  'eb-jolta': ['JE- 70D', 'JE-100LI', 'JE-70LI', 'JES-70D', 'JE-70 D SE', 'JES-70LI', 'Others'],
  'eb-ms-jaguar': ['E-70', 'E-125', 'E-70 Supreme', 'E-Heavy Bike', 'E-Scooter', 'Others'],
  'eb-metro': ['E8S PRO', 'T9', 'LY', 'M6', 'Others'],
  'eb-pakzon': ['PES-70L', 'PE-100L', 'PE-70D', 'PE-70L', 'PE-100D', 'PES-70D', 'Others'],
  'eb-road-prince': ['E-GO', 'Zeus E-Bike', 'Others'],
  'eb-okla': ['OKG', 'Others'],
  'eb-vlektra': ['Bolt', 'Bolt Dark', '1969', 'Velocity 180', 'Velocity 180SE', 'Retro', 'Others'],
  'eb-e-turbo': ['ThunderBolt', 'Others'],
  'eb-zhong-fa': ['CZ 125', 'G8-3000', 'Z6-2000', 'Others'],
  'eb-united': ['United EV', 'Others'],
  'eb-crown': ['Crown EV', 'Others'],
  'eb-others': ['Other Electric Bike Model'],

  // Sports & Heavy Bike models
  'shb-honda': ['CBR 150R', 'CBR 400', 'CBX', 'CBR 250RR', 'CBR 1000RR', 'NC 700X', 'Interceptor', 'NSR 150', 'VFR 400RR', 'CBR 1000RR-R Fireblade', 'CBR 450', 'CBR 500R', 'CBR 600R', 'CBR 650R', 'CBR 919RR', 'Others'],
  'shb-kawasaki': ['Ninja 250R', 'Ninja ZX-10R', 'Ninja ZX300', 'Ninja ZX-6R', 'Z1000', 'Ninja H2R', 'ZZR-250', 'ZZR600', 'Ninja 650R', 'Ninja 500R', 'Ninja ZX-14 Monster Energy', 'Ninja H2', 'Ninja H2 SX', 'Ninja ZX-14', 'Ninja ZX-6R Monster Energy', 'Others'],
  'shb-suzuki': ['Gixxer 150', 'GSX-R600', 'GSXR 250cc', 'Hayabusa', 'GSX-R750', 'GSX-R1000', 'GSX650F', 'GSX600F Katana', 'Others'],
  'shb-yamaha': ['YZF-R6', 'YZF-R3', 'YZF-R1', 'FZR 250', 'FZR 400', 'YZF-R6S', 'FJR1300A', 'FJR1300AE', 'FZ6', 'YFR 4000', 'XJ6', 'FZ6R', 'Others'],
  'shb-super-power': ['Leo 200', 'Sultan SP 250', 'Others'],
  'shb-super-star': ['200CC', 'Others'],
  'shb-bmw': ['S1000RR', 'F 800 ST', 'K 1300 S', 'F 850 GS', 'HP 4', 'G 650 GS', 'HP 2 Megamoto', 'HP 2 Sport', 'HP 4 Competition', 'Others'],
  'shb-cf-moto': ['300 SR', '650 TR-G', '650 GT', '700 CL-X Sport', '800 MT Sport', 'Others'],
  'shb-cyclone': ['RC3', 'RZ3', 'RZ3S', 'Others'],
  'shb-ducati': ['GT Edition', 'Panigale V4', 'Panigale V2', 'Monster', 'Others'],
  'shb-super-asia': ['Viking', 'Others'],
  'shb-voge': ['RR660S', 'DS900X', 'DS525X', 'DS800X Rally', '300DS', 'Others'],
  'shb-others': ['Other Sports / Heavy Bike Model'],

  // Trail bike models
  'tb-yamaha': ['WR250', 'TT-R110E', 'PW50', 'TT-R125E', 'TT-R50E', 'PW80', 'TT-R125L-LE', 'TT-R230', 'TT-R250', 'Others'],
  'tb-suzuki': ['DR-Z125', 'DR-Z125L', 'RM85L', 'RM85', 'DR-Z70', 'RM-Z250', 'RM-Z450', 'RM250', 'Others'],
  'tb-zongshen': ['ZS150GY-9', 'Others'],
  'tb-kawasaki': ['KDX200', 'KLX110', 'KLX140', 'KX100', 'KLX110 Monster Energy', 'KLX140 Monster Energy', 'KLX140L', 'KLX140L Monster Energy', 'KX100 Monster Energy', 'KX250F', 'KX250F Monster Energy', 'KX450F', 'KX450F Monster Energy', 'KX85', 'KX85 Monster Energy', 'Others'],
  'tb-cineco': ['Z1 pole engraving', 'Others'],
  'tb-qingqi': ['QM125GY-2B(ASD)', 'QM200GY', 'QM250GY-D(DA)', 'QM125GY-2B(BSD)', 'QM125GY-G(BSD)', 'QM200GY-B(SD)', 'QM200GY-B(ASD)', 'QM200GY-B(BSD)', 'QM200GY-F EFI', 'QM200GY-H(ASD)', 'QM200GY-H(BSD)', 'QM250GY-B(A)', 'QM250GY-B(BSD)', 'QM250GY-D', 'QM250GY-D(A)', 'Others'],
  'tb-others': ['Other Trail Bike Model'],

  // Cafe Racer models
  'cfr-hi-speed': ['Infinity 150', 'Others'],
  'cfr-super-star': ['Falcon', 'Others'],
  'cfr-benelli': ['Cafe Racer 1130', 'Leoncino', 'Others'],
  'cfr-cf-moto': ['250 CL-X', '700 CL-X Heritage', 'Others'],
  'cfr-bmw': ['R nineT', 'Others'],
  'cfr-cyclone': ['RE3', 'Others'],
  'cfr-qingqi': ['QM125-2X CAFÉ RACER', 'QM250-2X', 'QM125-2X scrambler', 'QM125-2X CAFÉ', 'QM125-2X B', 'QM125-2X A', 'QM200-2X B', 'Others'],
  'cfr-zongshen': ['Infinity', 'Others'],
  'cfr-others': ['Other Cafe Racer Model'],

  // Electric Scooter models
  'esc-honda': ['EM1 e:', 'Benly e:', 'U-GO', 'Cub e:', 'Others'],
  'esc-united': ['United EV Scooter', 'Star EV', 'Others'],
  'esc-zhong-fa': ['Zhong Fa E-Scooter', 'Others'],
  'esc-yj-future': ['YJ Future EV', 'Others'],
  'esc-jinpeng': ['Jinpeng EV', 'M6', 'Others'],
  'esc-evee': ['C1 Pro', 'C1', 'Nisa', 'GenZ', 'S1', 'Others'],
  'esc-eveon': ['Eveon EV', 'Others'],
  'esc-metro': ['E8S Pro', 'T9', 'LY', 'M6', 'Others'],
  'esc-ms-jaguar': ['E-Scooter', 'E-Viper', 'Others'],
  'esc-okla': ['OKG', 'EFUN', 'Others'],
  'esc-ramza': ['Ramza EV', 'Others'],
  'esc-yadea': ['T9', 'E8S Pro', 'G5', 'M6', 'Others'],
  'esc-king': ['King EV Scooter', 'Others'],
  'esc-others': ['Other Electric Scooter Model'],

  // Petrol Scooter models
  'psc-honda': ['Dio', 'Activa', 'PCX 150', 'Forza 300', 'Beat', 'Others'],
  'psc-vespa': ['Primavera 150', 'GTS 300', 'Sprint 150', 'LX 125', 'Others'],
  'psc-yamaha': ['NMAX 155', 'Aerox 155', 'Fascino 125', 'Zuma 125', 'Others'],
  'psc-suzuki': ['Burgman Street 125', 'Access 125', 'Address 110', 'Others'],
  'psc-united': ['United 100cc Scooter', 'United 50cc Scooter', 'Others'],
  'psc-road-prince': ['RP 100 Scooter', 'Others'],
  'psc-crown': ['Crown Scooter 100', 'Others'],
  'psc-super-power': ['SP 100 Scooter', 'Others'],
  'psc-qingqi': ['Qingqi 100cc Scooter', 'Others'],
  'psc-others': ['Other Petrol Scooter Model'],

  // Motorcycle models
  'bike-honda': [
    'CG 125',
    'CD 70',
    'Pridor',
    'CB 150F',
    'CG 125 Special Edition',
    'CD 100',
    'CB 125F',
    'CD 70 Dream',
    'CB 125',
    'CG 125 Deluxe',
    'CG 125 Dream',
    'CD 200',
    'Deluxe',
    'Road Master',
    'CB 200',
    'CD 100 Euro 2',
    'CD 175',
    'CB 180',
    'CB 250F',
    'CB175',
    'CB 400',
    'CB 900F',
    'CB 1100',
    'CB 1000R',
    'CG 150',
    'Others'
  ],
  'bike-yamaha': [
    'YBR 125G',
    'YBR 125',
    'YB 125Z',
    'YB 125Z-DX',
    'Royale YB 100',
    'Dhoom YD-70',
    'YD-100 Junoon',
    '4 YD 100',
    'DX-100',
    'RX 115',
    'Mini 100 Euro II',
    'MT-09',
    'FZ1',
    'Others'
  ],
  'bike-suzuki': [
    'GS 150',
    'GD 110',
    'GS 150 SE',
    'GR 150',
    'GD 1105',
    'GS-125',
    'Sprinter',
    'GP 100',
    'Raider 110',
    'Shogun',
    'GS 500E',
    'Sprinter ECO',
    'Bandit',
    'Inazuma',
    'SV650',
    'Bandit 250VC',
    'Gladius',
    'GS500F',
    'GS750',
    'RG 125',
    'TU250X',
    'Bandit 1250S',
    'Bandit 1250S ABS',
    'Bandit 400VC',
    'GN 250',
    'GSF 400',
    'GSF 650',
    'SV650 ABS',
    'SV650SF',
    'SV650SF ABS',
    'Others'
  ],
  'bike-kawasaki': ['GTO 125', 'GTO 100', 'GTO 110', 'Eliminator 125', 'GT 550', 'ER-6n', 'GTO 70', 'Others'],
  'bike-road-prince': ['RP 70 Passion', 'Wego 150', 'RP 110', 'RP 125 Euro II', 'Twister 125', 'Bullet', 'Robinson 150', 'Others'],
  'bike-unique': ['Xtreme UD 70', 'UD 125', 'UD 100', 'Crazer UD 150', 'Others'],
  'bike-super-power': ['SP 70', 'SP 125', 'Deluxe 70', 'SP 110 Cheetah', 'SP 100', 'SP 150 Archi', 'PK 150 Archi', 'SP 125 Delux', 'SP 70 Tokyo', 'Others'],
  'bike-united': ['US 70', 'US 125 Euro II', 'US 100', 'US 125 Deluxe', 'US 150 Ultimate', 'US 100 Jazba', 'Others'],
  'bike-hi-speed': ['CDI SR-70CC Euro-2', 'Infinity 150', 'SR 125', 'Alpha 100', 'Others'],
  'bike-crown': ['RF 70', 'CRLF 70', 'CR 70 HD Plus', 'CR 125 Euro II', 'CR 70 Self Start', 'CRLF 70cc Euro II', 'FIT 150 Fighter', 'CR 100 Excellence', 'CR 70 Jazba', 'CRLF Spoke Wheel', 'Others'],
  'bike-vespa': ['Vespa GTS', 'Vespa Primavera', 'Vespa LX', 'Others'],
  'bike-zontes': ['310R', '310X', '310T', '350D', 'Others'],
  'bike-benelli': ['TNT 150i', 'TNT 25', 'TNT 600', '180S', 'TRK 502', 'Others'],
  'bike-keeway': ['Superlight 150', 'RKS 150', 'TX 200', 'Others'],
  'bike-harley': ['Iron 883', 'Forty-Eight', 'Street 750', 'Fat Boy', 'Others'],
  'bike-bmw': ['G310R', 'G310GS', 'R1250GS', 'S1000RR', 'Others'],
  'bike-super-star': ['CD 70', '125cc', '100cc', 'Others'],
  'bike-union-star': ['70cc', '70 Deluxe', '125', 'Others'],
  'bike-metro': ['MR 70', 'MR 125', 'Boom 70', 'Tez Raftar 70', 'MR 100', 'Dabang Euro II 70', 'Jeet 70', 'MR-70 Limited Edition', 'Others'],
  'bike-ravi': ['Humsafar 70', 'Piaggio Storm 125', 'Humsafar Plus', 'Premium R1', 'Others'],
  'bike-hero': ['RF 70', 'RF 125', 'Plus 90', 'Splander 100', 'Others'],
  'bike-super-asia': ['SA 70', 'Others'],
  'bike-power': ['PK 70', 'PK Deluxe', 'PK 125', 'Others'],
  'bike-pak-hero': ['RF 70', 'PH 70', 'PK125', 'Others'],
  'bike-others': ['Other Motorcycle Model'],

  // Bicycles models
  'bicy-soho': ['Standard', 'Mountain', 'Road', 'Foldable', 'Others'],
  'bicy-phoenix': ['Classic Double Bar', 'Classic Single Bar', 'MTB', 'Road', 'Others'],
  'bicy-trinx': ['M100', 'M136', 'Tempo 1.0', 'Drive', 'Others'],
  'bicy-giant': ['Talon', 'ATX', 'Escape', 'Defy', 'Others'],
  'bicy-trek': ['Marlin', 'FX', 'Domane', 'Fuel EX', 'Others'],
  'bicy-specialized': ['Rockhopper', 'Sirrus', 'Allez', 'Stumpjumper', 'Others'],
  'bicy-others': ['Other Bicycle Model'],

  // Scooter models
  'scoot-vespa': ['GTS 300', 'Primavera 150', 'Sprint 150', 'LX 125', 'Others'],
  'scoot-honda': ['Dio', 'PCX', 'Activa', 'Zoomer', 'Others'],
  'scoot-suzuki': ['Burgman Street', 'Access 125', 'Address', 'Others'],
  'scoot-yamaha': ['NMAX', 'AEROX', 'Fascino', 'RayZR', 'Others'],
  'scoot-united': ['US 50', 'US 100 Scooter', 'Others'],
  'scoot-road-prince': ['Bella 100', 'Zeus E-Bike', 'Others'],
  'scoot-vlektra': ['Retro', 'Bolt', '1971', 'Others'],
  'scoot-jolta': ['JE-70 Li', 'JE-100 L', 'Others'],
  'scoot-ezo': ['Ezo E-Scooter', 'Others'],
  'scoot-others': ['Other Scooter Model'],

  // ATV & Quads models
  'atv-honda': ['TRX 90X', 'TRX 250X', 'FourTrax Recon', 'FourTrax Foreman', 'Others'],
  'atv-yamaha': ['Raptor 90', 'YFZ450R', 'Grizzly 90', 'Kodiak 450', 'Others'],
  'atv-suzuki': ['QuadSport Z50', 'QuadSport Z90', 'KingQuad 400', 'Others'],
  'atv-kawasaki': ['KFX50', 'KFX90', 'Brute Force 300', 'Others'],
  'atv-polaris': ['Outlaw 70', 'Sportsman 110', 'Phoenix 200', 'Others'],
  'atv-canam': ['DS 90', 'DS 250', 'Outlander 450', 'Others'],
  'atv-china': ['50cc Kids ATV', '70cc Kids ATV', '110cc Quad Bike', '125cc Quad Bike', '150cc Utility ATV', '200cc Quad Bike', '250cc Quad Bike', 'Others'],
  'atv-others': ['Other ATV / Quad Model']
};

// Manual add option
const MANUAL_ADD_OPTION = 'manual-add-model';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  price: z.number().min(0, 'Price cannot be negative'),
  currency: z.string(),
  category_id: z.string().min(1, 'Category is required'),
  subcategory_id: z.string().optional(),
  sub_subcategory_id: z.string().optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  city: z.string().min(1, 'City is required'),
  location: z.string().optional(),
  is_negotiable: z.boolean(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listing?: Listing;
  onSuccess: (listing: Listing) => void;
}

const compressImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max_size = 1200; // Resize to max 1200px width/height
        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve('');
    };
  });
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const STEPS = [
  { id: 'category', title: 'Category' },
  { id: 'details', title: 'Ad Details' },
  { id: 'media', title: 'Photos & Video' },
  { id: 'pricing', title: 'Price & Location' },
  { id: 'preview', title: 'Review & Post' }
];

const ListingForm: React.FC<ListingFormProps> = ({ listing, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Categories loading
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected hierarchy
  const [mainCat, setMainCat] = useState<Category | null>(null);
  const [subCat, setSubCat] = useState<Category | null>(null);
  const [subSubCat, setSubSubCat] = useState<Category | null>(null);
  const [subSubSubCat, setSubSubSubCat] = useState<Category | null>(null);

  const isChargerCategory = subSubCat?.slug?.includes('chargers') ||
    subSubCat?.name === 'Chargers' ||
    subSubCat?.slug === 'acc-chargers';

  const isCableCategory = subSubCat?.slug?.includes('charging-cables') ||
    subSubCat?.name === 'Charging Cables' ||
    subSubCat?.slug === 'acc-charging-cables';

  const isCaseCategory = subSubCat?.slug?.includes('covers-and-cases') ||
    subSubCat?.name === 'Covers & Cases' ||
    subSubCat?.slug === 'acc-covers-and-cases';

  const isProtectorCategory = subSubCat?.slug?.includes('screen-protectors') ||
    subSubCat?.name === 'Screen Protectors' ||
    subSubCat?.slug === 'acc-screen-protectors';

  const isAccessoriesSubCategory = subCat?.id === 'c1000000-0000-0000-0000-000000000118' ||
    subCat?.slug === 'electronics-accessories' ||
    subCat?.name === 'Accessories';

  const isCameraSubCategory = subCat?.id === 'c1000000-0000-0000-0000-000000000116' ||
    subCat?.slug === 'cameras' ||
    subCat?.name === 'Cameras' ||
    subCat?.name === 'Camera & Accessories' ||
    subCat?.slug?.includes('cameras');

  const isComputerOtherAccCategory = subSubCat?.id === '3a4d9e5c-96b9-4787-b9b2-229dbdc869b2' ||
    (subCat?.slug === 'computers' && (
      subSubCat?.name === 'Other Accessories' ||
      subSubCat?.slug?.includes('other-accessories')
    ));

  const isCarCategory = subCat?.slug === 'cars' ||
    subCat?.name === 'Cars' ||
    subCat?.id === 'c1000000-0000-0000-0000-000000000101' ||
    subCat?.id === '2211f60e-0e53-4f88-a2d0-29474bdb63d8';

  const isCarsOnInstallments = subCat?.slug === 'cars-on-installments' ||
    subCat?.name === 'Cars on Installments' ||
    subCat?.id === 'c1000000-0000-0000-0000-000000000181';

  const isCarCategoryOrInstallments = isCarCategory || isCarsOnInstallments;

  const isTruckCategory = subCat?.slug === 'buses-vans-trucks' || 
    subCat?.slug === 'trucks-buses' || 
    subCat?.name === 'Buses, Vans & Trucks' || 
    subCat?.name === 'Trucks & Buses' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000104' ||
    subCat?.id === '7be9e846-46d8-48ac-bde0-123ca8ce2f8e';

  const isHeavyMachineryCategory = subCat?.slug === 'other-vehicles' || 
    subCat?.slug === 'heavy-machinery' || 
    subCat?.name === 'Other Vehicles' || 
    subCat?.name === 'Heavy Machinery' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000106' ||
    subCat?.id === '8f8af25c-821b-4a4c-afb3-d1330ed4bed1';

  const isRickshawCategory = subCat?.slug === 'rickshaw-chingchi' || 
    subCat?.name === 'Rickshaw & Chingchi' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000185';

  const isTractorCategory = subCat?.slug === 'tractors-trailers' || 
    subCat?.name === 'Tractors & Trailers' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000186';

  const isBoatsCategory = subCat?.slug === 'boats' || 
    subCat?.name === 'Boats' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000187';

  const isAccessoriesOrPartsCategory = subCat?.slug === 'cars-accessories' ||
    subCat?.slug === 'car-care' ||
    subCat?.slug === 'oil-lubricants' ||
    subCat?.slug === 'spare-parts' ||
    subCat?.slug === 'auto-parts' ||
    subCat?.name === 'Cars Accessories' ||
    subCat?.name === 'Car Care' ||
    subCat?.name === 'Oil & Lubricants' ||
    subCat?.name === 'Spare Parts' ||
    subCat?.id === 'cc0c0e8e-757b-42c8-8598-872fb6c6d870';

  const isCarOrPartsCategory = isCarCategoryOrInstallments || isAccessoriesOrPartsCategory;

  const isStandardBikeCategory = subSubCat?.slug === 'standard-bikes' || 
    subSubCat?.name === 'Standard Bikes' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000361';

  const isCruiserCategory = subSubCat?.slug === 'cruisers' || 
    subSubCat?.name === 'Cruisers' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000365';

  const isElectricBikeCategory = subSubCat?.slug === 'electric-bikes' || 
    subSubCat?.name === 'Electric Bikes' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000362';

  const isSportsHeavyBikeCategory = subSubCat?.slug === 'sports-heavy-bikes' || 
    subSubCat?.name === 'Sports & Heavy Bikes' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000363';

  const isTrailBikeCategory = subSubCat?.slug === 'trail' || 
    subSubCat?.name === 'Trail' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000364';

  const isCafeRacerCategory = subSubCat?.slug === 'cafe-racers' || 
    subSubCat?.name === 'Cafe Racers' || 
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000366';

  const isElectricScooterCategory = subSubCat?.slug === 'electric-scooters' || 
    (subSubCat?.name === 'Electric' && (subCat?.slug?.includes('scooter') || subCat?.name?.includes('Scooter'))) ||
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000372';

  const isPetrolScooterCategory = subSubCat?.slug === 'petrol-scooters' || 
    (subSubCat?.name === 'Petrol' && (subCat?.slug?.includes('scooter') || subCat?.name?.includes('Scooter'))) ||
    subSubCat?.id === 'c1000000-0000-0000-0000-000000000371';

  const isMotorcycleCategory = subCat?.slug === 'motorcycles' || subCat?.name === 'Motorcycles';
  const isBicycleCategory = subCat?.slug === 'bicycles' || subCat?.name === 'Bicycles';
  const isScooterCategory = subCat?.slug === 'scooters' || subCat?.name === 'Scooters' || subCat?.slug === 'scooters-scooty' || subCat?.name === 'Scooters & Scooty';
  const isAtvCategory = subCat?.slug === 'atv-quads' || subCat?.name === 'ATV & Quads';
  const isBikeCareCategory = subCat?.slug === 'bike-care' || 
    subCat?.name === 'Bike Care' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000356';

  const isLandPlotsCategory = subCat?.slug === 'land-plots' || 
    subCat?.slug === 'rent-land-plots' || 
    subCat?.name === 'Land & Plots' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000109' || 
    subCat?.id === '4c4a2d5d-7303-4b97-8e1e-775337fe894e' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000000108' ||
    subCat?.id === 'pr-land-plots';

  const isHousesCategory = subCat?.slug === 'houses' || 
    subCat?.slug === 'rent-houses' || 
    subCat?.name === 'Houses' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000107' || 
    subCat?.id === '24e59436-fa5b-4fe6-898c-4ce34c4b901f' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000000101' ||
    subCat?.id === 'pr-houses';

  const isApartmentsCategory = subCat?.slug === 'apartments-flats' || 
    subCat?.slug === 'rent-apartments-flats' || 
    subCat?.name === 'Apartments & Flats' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000108' || 
    subCat?.id === '9ef60e0a-9e89-4a78-86ef-5c9ea8b923dd' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000000102' ||
    subCat?.id === 'pr-apartments-flats';

  const isCommercialCategory = subCat?.slug === 'shops-offices-commercial-space' || 
    subCat?.slug === 'rent-shops-offices-commercial-space' || 
    subCat?.name === 'Shops - Offices - Commercial Space' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000110' || 
    subCat?.id === '3f9d177a-5fc9-4a78-803e-111cbbd5831c' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000000104' ||
    subCat?.id === 'pr-shops-offices';

  const isPortionsCategory = subCat?.slug === 'portions-floors' || 
    subCat?.slug === 'rent-portions-floors' || 
    subCat?.name === 'Portions & Floors' || 
    subCat?.id === 'c1000000-0000-0000-0000-000000000111' || 
    subCat?.id === 'a8dfa959-a83b-438c-8ffb-3faaa43b1626' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000000103' ||
    subCat?.id === 'pr-portions-floors';

  const isBikeCareOrPartsCategory = subCat?.slug === 'bike-spare-parts' || 
    subCat?.slug === 'bike-accessories' || 
    subCat?.slug === 'bike-care' ||
    (subCat?.name === 'Spare Parts' && (mainCat?.slug === 'bikes' || mainCat?.name === 'Bikes')) ||
    subCat?.name === 'Bikes Accessories' ||
    subCat?.name === 'Bike Care';

  const isPropertyForRentCategory = 
    mainCat?.id === 'c1000000-0000-0000-0000-000000000015' ||
    mainCat?.id === 'a8dfa959-a83b-438c-8ffb-3faaa43b1626' ||
    mainCat?.slug === 'property-for-rent' ||
    mainCat?.slug === 'rent' ||
    (mainCat?.name && /property for rent|rent/i.test(mainCat.name)) ||
    Boolean(subCat?.slug?.startsWith('rent-')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000001')) ||
    Boolean(subCat?.id?.startsWith('pr-')) ||
    Boolean(subCat?.slug?.includes('for-rent'));

  const isAnimalsCategory = 
    mainCat?.id === 'c1000000-0000-0000-0000-000000000009' ||
    mainCat?.slug === 'animals' ||
    mainCat?.slug === 'pets' ||
    mainCat?.name === 'Animals' ||
    mainCat?.name === 'Pets' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000b')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000c'));

  const isServicesCategory = 
    mainCat?.id === 'c1000000-0000-0000-0000-000000000007' ||
    mainCat?.slug === 'services' ||
    mainCat?.name === 'Services' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000d')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000e'));

  const isCarServicesSubcategory = isServicesCategory && (
    subCat?.id === 'd1000000-0000-0000-0000-000000000d04' ||
    subCat?.slug === 'car-services' ||
    subCat?.name === 'Car Services'
  );

  const isBusinessCategory = 
    mainCat?.id === 'c1000000-0000-0000-0000-000000000011' ||
    mainCat?.slug === 'business-industrial' ||
    mainCat?.name === 'Business & Industrial' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000f')) ||
    Boolean(subSubCat?.id?.startsWith('d1000000-0000-0000-0000-000000000f'));

  const isElectronicsCategory = !isAnimalsCategory && (
    mainCat?.id === 'c1000000-0000-0000-0000-000000000016' ||
    mainCat?.slug === 'electronics-home-appliances' ||
    mainCat?.name === 'Electronics & Home Appliances' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000002')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000006')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000007')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000008')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000009')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000000a'))
  );

  const isFurnitureCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000006' ||
    mainCat?.slug === 'furniture-home-decor' ||
    mainCat?.name === 'Furniture & Home Decor' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-00000000031')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-00000000032')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000001')) ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000002'));

  const isJobsCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000004' ||
    mainCat?.slug === 'jobs' ||
    mainCat?.name === 'Jobs' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000004'));

  const isFashionCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000005' ||
    mainCat?.slug === 'fashion-beauty' ||
    mainCat?.name === 'Fashion & Beauty' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000005'));

  const isEducationCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000008' ||
    mainCat?.slug === 'education' ||
    mainCat?.name === 'Education' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000008'));

  const isSportsCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000010' ||
    mainCat?.slug === 'sports-hobbies' ||
    mainCat?.name === 'Sports & Hobbies' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000009'));

  const isAgricultureCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000012' ||
    mainCat?.slug === 'agriculture' ||
    mainCat?.name === 'Agriculture' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-00000000a'));

  const isAgriculturalLandCategory = subCat?.id === 'd1000000-0000-0000-0000-00000000a010' ||
    subCat?.slug === 'agri-land' ||
    subCat?.name === 'Agricultural Land';

  const isCropProduceCategory = subCat?.id === 'd1000000-0000-0000-0000-00000000a011' ||
    subCat?.slug === 'agri-produce' ||
    subCat?.name === 'Crop Produce';

  const isKidsCategory = mainCat?.id === 'c1000000-0000-0000-0000-000000000017' ||
    mainCat?.slug === 'kids' ||
    mainCat?.name === 'Kids' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-000000007'));

  const isKidsClothing = isKidsCategory && (
    subCat?.id === 'd1000000-0000-0000-0000-000000007007' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000077')) ||
    subCat?.slug?.includes('clothing') ||
    subCat?.name?.includes('Clothing')
  );

  const isKidsBathDiapers = isKidsCategory && (
    subCat?.id === 'd1000000-0000-0000-0000-000000007005' ||
    Boolean(subCat?.id?.startsWith('d1000000-0000-0000-0000-0000000075')) ||
    subCat?.slug?.includes('bath-diapers') ||
    subCat?.name?.includes('Bath & Diapers')
  );

  const isKidsThreeOption = isKidsCategory && !isKidsClothing && !isKidsBathDiapers;

  const isBeautyCategory = isFashionCategory && (
    subCat?.name === 'Makeup' || subCat?.name === 'Skin & Hair' || subCat?.name === 'Bath & Body' ||
    subCat?.id === 'd1000000-0000-0000-0000-000000005005' || // Makeup
    subCat?.id === 'd1000000-0000-0000-0000-000000005006' || // Skin & Hair
    subCat?.id === 'd1000000-0000-0000-0000-000000005009'    // Bath & Body
  );

  const isClothingOrFashion = isFashionCategory && !isBeautyCategory;

  const isBikeMakeInsteadOfBrand = isMotorcycleCategory || isScooterCategory || isAtvCategory;

  const isMakeInsteadOfBrand = isCarCategoryOrInstallments || isTruckCategory || isRickshawCategory || isTractorCategory || isBikeMakeInsteadOfBrand;

  const isSimplifiedCondition = isCarCategoryOrInstallments ||
    isTruckCategory ||
    isHeavyMachineryCategory ||
    isRickshawCategory ||
    isTractorCategory ||
    isBoatsCategory ||
    isAccessoriesOrPartsCategory ||
    isMotorcycleCategory ||
    isBicycleCategory ||
    isScooterCategory ||
    isAtvCategory ||
    isBikeCareOrPartsCategory ||
    isElectronicsCategory ||
    isClothingOrFashion ||
    isAnimalsCategory ||
    isEducationCategory ||
    isSportsCategory ||
    isAgricultureCategory ||
    isKidsClothing;

  // Dynamic attributes values
  const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, string>>(listing?.attributes || {});

  // Dynamic Brands and Models from Supabase
  const [brands, setBrands] = useState<{ id: string; name: string; logoUrl?: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [isUsingStaticBrands, setIsUsingStaticBrands] = useState(false);

  // Manual brand input states
  const [isManualBrand, setIsManualBrand] = useState(false);
  const [manualBrandValue, setManualBrandValue] = useState('');

  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  // Manual laptop type states
  const [selectedLaptopTypeId, setSelectedLaptopTypeId] = useState('');
  const [isManualLaptopType, setIsManualLaptopType] = useState(false);
  const [manualLaptopTypeValue, setManualLaptopTypeValue] = useState('');
  // Manual camera type states
  const [selectedCameraTypeId, setSelectedCameraTypeId] = useState('');
  const [isManualCameraType, setIsManualCameraType] = useState(false);
  const [manualCameraTypeValue, setManualCameraTypeValue] = useState('');

  // Manual camera accessories type states
  const [selectedCameraAccTypeId, setSelectedCameraAccTypeId] = useState('');
  const [isManualCameraAccType, setIsManualCameraAccType] = useState(false);
  const [manualCameraAccTypeValue, setManualCameraAccTypeValue] = useState('');

  // Chargers type states
  const [selectedChargerTypeId, setSelectedChargerTypeId] = useState('');
  const [isManualChargerType, setIsManualChargerType] = useState(false);
  const [manualChargerTypeValue, setManualChargerTypeValue] = useState('');

  // Charging cables type states
  const [selectedCableTypeId, setSelectedCableTypeId] = useState('');
  const [isManualCableType, setIsManualCableType] = useState(false);
  const [manualCableTypeValue, setManualCableTypeValue] = useState('');

  // Manual model input states
  const [isManualModel, setIsManualModel] = useState(false);
  const [manualModelValue, setManualModelValue] = useState('');

  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // User Details / Contact Information states
  const [contactName, setContactName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleUnifiedLocate = async () => {
    setFetchingGeo(true);
    const toastId = toast.loading('Locating your position...');
    
    if (!navigator.geolocation) {
      toast.dismiss(toastId);
      toast.error('Geolocation is not supported by your browser.');
      setFetchingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let { latitude, longitude } = position.coords;
        try {
          // IP fallback check if browser geolocates to Lahore center (common ISP routing fallback in Pakistan)
          const isLahoreCenter = Math.abs(latitude - 31.5204) < 0.15 && Math.abs(longitude - 74.3587) < 0.15;
          let lat = latitude;
          let lon = longitude;

          if (isLahoreCenter) {
            try {
              const ipRes = await fetch('https://ipinfo.io/json');
              if (ipRes.ok) {
                const ipData = await ipRes.json();
                if (ipData.loc && ipData.city) {
                  if (ipData.city.toLowerCase() !== 'lahore') {
                    const [latStr, lonStr] = ipData.loc.split(',');
                    lat = parseFloat(latStr);
                    lon = parseFloat(lonStr);
                  }
                }
              }
            } catch (ipErr) {
              console.error('IP Geolocation fallback failed:', ipErr);
            }
          }

          // Reverse geocode at zoom level 18
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18`);
          const data = await res.json();
          const addr = data.address || {};

          // First, check if any field matches official CITIES list
          let matchedCity = CITIES.find(c => 
            (addr.city && addr.city.toLowerCase().includes(c.toLowerCase())) ||
            (addr.town && addr.town.toLowerCase().includes(c.toLowerCase())) ||
            (addr.municipality && addr.municipality.toLowerCase().includes(c.toLowerCase())) ||
            (addr.county && addr.county.toLowerCase().includes(c.toLowerCase())) ||
            (addr.state_district && addr.state_district.toLowerCase().includes(c.toLowerCase())) ||
            (addr.state && addr.state.toLowerCase().includes(c.toLowerCase()))
          );

          let cleanCity = matchedCity || addr.city || addr.town || addr.village || addr.state_district || addr.state || '';
          cleanCity = cleanCity.replace(/\s+District|\s+Tehsil|City/gi, '').trim();

          let rawArea = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential || addr.road || addr.city_district || addr.building || addr.amenity || '';
          let fetchedArea = rawArea.trim();

          if (cleanCity && fetchedArea) {
            const cityRegex = new RegExp(`\\s*(?:of|in|near)?\\s*${cleanCity}`, 'gi');
            fetchedArea = fetchedArea.replace(cityRegex, '').trim();
            fetchedArea = fetchedArea.replace(/^,\s*|,\s*$/g, '').trim();
          }

          if (!fetchedArea && data.display_name) {
            const parts = data.display_name.split(',').map((p: string) => p.trim());
            const filteredParts = parts.filter((part: string) => {
              if (!part) return false;
              const isNumeric = /^\d+$/.test(part);
              const containsCity = cleanCity && part.toLowerCase().includes(cleanCity.toLowerCase());
              const containsCountry = part.toLowerCase().includes('pakistan');
              const containsProvince = part.toLowerCase().includes('punjab') || part.toLowerCase().includes('sindh') || part.toLowerCase().includes('kpk') || part.toLowerCase().includes('balochistan');
              return !isNumeric && !containsCity && !containsCountry && !containsProvince;
            });
            if (filteredParts.length > 0) {
              fetchedArea = filteredParts[0];
            }
          }

          if (cleanCity) {
            const unifiedLocation = fetchedArea && fetchedArea.toLowerCase() !== cleanCity.toLowerCase() ? `${cleanCity}, ${fetchedArea}` : cleanCity;
            setValue('city', unifiedLocation);
            toast.dismiss(toastId);
            toast.success(`Location detected: ${unifiedLocation}`);
          } else {
            toast.dismiss(toastId);
            toast.error('Could not determine city name.');
          }
        } catch (err) {
          console.error(err);
          toast.dismiss(toastId);
          toast.error('Error reverse geocoding location.');
        } finally {
          setFetchingGeo(false);
        }
      },
      (error) => {
        toast.dismiss(toastId);
        console.error(error);
        toast.error('Failed to retrieve location coordinates.');
        setFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Media
  const [images, setImages] = useState<string[]>(listing?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<string | null>(listing?.video_url || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // AI features status
  const [aiTitles, setAiTitles] = useState<string[]>([]);
  const [suggestingTitles, setSuggestingTitles] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState<{ min: number; max: number; suggested: number } | null>(null);
  const [spamAnalysis, setSpamAnalysis] = useState<{ isSpam: boolean; reason?: string } | null>(null);
  const [analyzingSpam, setAnalyzingSpam] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing?.title || '',
      description: listing?.description || '',
      price: listing?.price || 0,
      currency: listing?.currency || 'PKR',
      category_id: listing?.category_id || '',
      subcategory_id: listing?.subcategory_id || '',
      sub_subcategory_id: (listing as any)?.sub_subcategory_id || '',
      condition: listing?.condition || 'good',
      city: listing ? (listing.location ? `${listing.city}, ${listing.location}` : listing.city) : '',
      location: listing?.location || '',
      is_negotiable: listing?.is_negotiable || false,
    },
  });

  const isPriceEnabled = useMemo(() => {
    const active = subSubSubCat || subSubCat || subCat || mainCat;
    if (!active) return true;
    return getPriceEnabled((active as any).attributes_schema) && !isServicesCategory && !isJobsCategory;
  }, [mainCat, subCat, subSubCat, subSubSubCat, isServicesCategory, isJobsCategory]);

  useEffect(() => {
    if (!isPriceEnabled) {
      setValue('price', 0);
      setValue('is_negotiable', false);
    }
  }, [isPriceEnabled, setValue]);

  const [autoGeneratedTitle, setAutoGeneratedTitle] = useState('');
  const userEditedTitleRef = useRef(false);

  // Automatically write/update Ad Title across all categories when Brand/Make, Model, or Year is selected
  useEffect(() => {
    let brandName = '';
    if (dynamicAttrs.brand) {
      brandName = dynamicAttrs.brand;
    } else if (isManualBrand && manualBrandValue) {
      brandName = manualBrandValue;
    } else if (selectedBrandId && selectedBrandId !== 'manual-add-brand') {
      const foundBrand = brands.find(b => b.id === selectedBrandId);
      if (foundBrand) brandName = foundBrand.name;
    }

    let modelName = '';
    if (dynamicAttrs.model) {
      modelName = dynamicAttrs.model;
    } else if (isManualModel && manualModelValue) {
      modelName = manualModelValue;
    }

    const year = dynamicAttrs.year || '';

    const parts: string[] = [];
    if (brandName) parts.push(brandName);
    if (modelName) parts.push(modelName);
    if (year && (isCarCategoryOrInstallments || isTruckCategory || isMotorcycleCategory || isRickshawCategory || isTractorCategory || isBoatsCategory)) {
      parts.push(year);
    }

    const newAutoTitle = parts.join(' ');

    if (newAutoTitle) {
      const currentTitle = watch('title');
      if (!currentTitle || currentTitle === autoGeneratedTitle || !userEditedTitleRef.current) {
        setValue('title', newAutoTitle, { shouldValidate: true });
        setAutoGeneratedTitle(newAutoTitle);
      }
    }
  }, [
    selectedBrandId,
    manualBrandValue,
    isManualBrand,
    manualModelValue,
    isManualModel,
    dynamicAttrs.brand,
    dynamicAttrs.model,
    dynamicAttrs.year,
    brands
  ]);

  // Resolve Laptop Type state on load if editing an ad
  useEffect(() => {
    if (listing && listing.attributes?.type) {
      const active = subSubCat || subCat || mainCat;
      const isLaptop = active?.slug?.includes('laptop') ||
        active?.name?.toLowerCase().includes('laptop') ||
        active?.id === '460d3a2e-6f44-4363-a457-f9323cbd7aff';

      if (isLaptop) {
        const match = STATIC_LAPTOP_TYPES.find(t => t.name === listing.attributes.type);
        if (match) {
          setSelectedLaptopTypeId(match.id);
        } else {
          setSelectedLaptopTypeId('manual-add-type');
          setIsManualLaptopType(true);
          setManualLaptopTypeValue(listing.attributes.type);
        }
      }
    }
  }, [listing, subCat, subSubCat, mainCat]);

  // Resolve Camera Type state on load if editing an ad
  useEffect(() => {
    if (listing && listing.attributes?.type) {
      const active = subSubCat || subCat || mainCat;
      const isCamera = active?.slug?.includes('digital-camera') ||
        active?.name?.toLowerCase().includes('digital-camera') ||
        active?.name?.toLowerCase().includes('digital camera');

      if (isCamera) {
        const match = STATIC_CAMERA_TYPES.find(t => t.name === listing.attributes.type);
        if (match) {
          setSelectedCameraTypeId(match.id);
        } else {
          setSelectedCameraTypeId('manual-add-type');
          setIsManualCameraType(true);
          setManualCameraTypeValue(listing.attributes.type);
        }
      }
    }
  }, [listing, subCat, subSubCat, mainCat]);

  const watchTitle = watch('title');
  const watchCategory = watch('category_id');
  const watchPrice = watch('price');
  const watchDescription = watch('description');
  const watchCity = watch('city');

  const filteredCities = useMemo(() => {
    const typedPart = (watchCity || '').split(',')[0].trim().toLowerCase();
    if (!typedPart) return CITIES;
    return CITIES.filter(c => c.toLowerCase().includes(typedPart));
  }, [watchCity]);

  // Fetch Brands when Category selection changes
  useEffect(() => {
    const validCatId = cleanUuid(watchCategory);
    if (validCatId) {
      setBrandsLoading(true);
      setIsUsingStaticBrands(false);

      supabase
        .from('category_field_options')
        .select('id, name')
        .eq('category_id', validCatId)
        .is('parent_id', null)
        .then(({ data, error }) => {
          // Ignore table-not-found errors (PGRST205) - table may not exist yet
          const tableNotFound = error?.code === 'PGRST205' || (error as any)?.status === 404;
          if (!error && !tableNotFound && data && data.length > 0) {
            // Use brands from Supabase
            setBrands(data);
            setIsUsingStaticBrands(false);
            if (listing && listing.attributes?.brand) {
              const match = data.find(b => b.name === listing.attributes.brand);
              if (match) {
                setSelectedBrandId(match.id);
              }
            }
          } else {
            // Fallback to static brand list for mobile & laptop categories
            const cat = allCategories.find(c => c.id === watchCategory);
            const isMonitor = cat?.slug === 'computers-monitors' ||
              cat?.name === 'Monitors' ||
              cat?.id === '7f2c7382-fb48-48dd-9895-95cb02f9b1b9';

            const isCamera = cat?.slug?.includes('digital-camera') ||
              cat?.name?.toLowerCase().includes('digital camera') ||
              cat?.name?.toLowerCase().includes('digital-camera') ||
              cat?.slug?.includes('camera-lenses') ||
              cat?.name?.toLowerCase().includes('camera lenses');

            const isTripod = cat?.slug?.includes('tripods-and-stands') ||
              cat?.name === 'Tripods & Stands' ||
              cat?.slug === 'camera-tripods-and-stands';

            const isVideoLight = cat?.slug?.includes('video-lights') ||
              cat?.name === 'Video Lights' ||
              cat?.slug === 'camera-video-lights';

            const isVideoCamera = cat?.slug?.includes('video-cameras') ||
              cat?.name === 'Video Cameras' ||
              cat?.slug === 'camera-video-cameras';

            const isCameraBattery = cat?.slug?.includes('camera-batteries') ||
              cat?.name === 'Camera Batteries' ||
              cat?.slug === 'camera-camera-batteries';

            const isCctv = cat?.slug?.includes('cctv-cameras') ||
              cat?.name === 'CCTV Cameras' ||
              cat?.slug === 'camera-cctv-cameras';

            const isGimbal = cat?.slug?.includes('gimbles-and-stablizers') ||
              cat?.name?.includes('Gimbles') ||
              cat?.slug === 'camera-gimbles-and-stablizers';

            const isDrone = cat?.slug?.includes('drones') ||
              cat?.name === 'Drones' ||
              cat?.slug === 'camera-drones';

            const isCameraAcc = cat?.slug?.includes('camera-and-lenses-accessories') ||
              cat?.name === 'Camera & Lenses Accessories' ||
              cat?.slug === 'camera-camera-and-lenses-accessories';

            const isCharger = cat?.slug?.includes('chargers') ||
              cat?.name === 'Chargers' ||
              cat?.slug === 'acc-chargers';

            const isCable = cat?.slug?.includes('charging-cables') ||
              cat?.name === 'Charging Cables' ||
              cat?.slug === 'acc-charging-cables';

            const isCase = cat?.slug?.includes('covers-and-cases') ||
              cat?.name === 'Covers & Cases' ||
              cat?.slug === 'acc-covers-and-cases';

            const isProtector = cat?.slug?.includes('screen-protectors') ||
              cat?.name === 'Screen Protectors' ||
              cat?.slug === 'acc-screen-protectors';

            const isConsole = cat?.slug?.includes('gaming-consoles') ||
              cat?.name === 'Gaming Consoles' ||
              cat?.id === 'c1000000-0000-0000-0000-000000000117';

            const isCar = isCarCategoryOrInstallments;
            const isTruck = isTruckCategory;
            const isRickshaw = isRickshawCategory;
            const isTractor = isTractorCategory;
            const isStandardBike = isStandardBikeCategory;
            const isCruiser = isCruiserCategory;
            const isElectricBike = isElectricBikeCategory;
            const isSportsHeavyBike = isSportsHeavyBikeCategory;
            const isTrailBike = isTrailBikeCategory;
            const isCafeRacer = isCafeRacerCategory;
            const isElectricScooter = isElectricScooterCategory;
            const isPetrolScooter = isPetrolScooterCategory;
            const isMotorcycle = isMotorcycleCategory;
            const isBicycle = isBicycleCategory;
            const isScooter = isScooterCategory;
            const isAtv = isAtvCategory;
 
            const isMobile = !isBusinessCategory && !isServicesCategory && (
              (cat?.slug?.includes('mobile') && cat?.slug !== 'mobile-shops' && !cat?.slug?.includes('mobile-shop')) ||
              cat?.slug?.includes('phone') ||
              (cat?.name?.toLowerCase().includes('phone') && !cat?.name?.toLowerCase().includes('mobile shop')) ||
              cat?.name?.toLowerCase().includes('tablet') ||
              cat?.slug?.includes('laptop') ||
              cat?.name?.toLowerCase().includes('laptop') ||
              cat?.id === '460d3a2e-6f44-4363-a457-f9323cbd7aff' ||
              isMonitor ||
              isCamera ||
              isTripod ||
              isVideoLight ||
              isVideoCamera ||
              isCameraBattery ||
              isCctv ||
              isGimbal ||
              isDrone ||
              isCameraAcc ||
              isCharger ||
              isCable ||
              isCase ||
              isProtector ||
              isConsole ||
              isCar ||
              isTruck ||
              isRickshaw ||
              isTractor ||
              isStandardBike ||
              isCruiser ||
              isElectricBike ||
              isSportsHeavyBike ||
              isTrailBike ||
              isCafeRacer ||
              isElectricScooter ||
              isPetrolScooter ||
              isMotorcycle ||
              isBicycle ||
              isScooter ||
              isAtv
            );
 
            if (isMobile) {
              const isTablet = cat?.slug?.includes('tablet') || cat?.name?.toLowerCase().includes('tablet') || cat?.id === 'c1000000-0000-0000-0000-000000000113';
              const isLaptop = cat?.slug?.includes('laptop') || cat?.name?.toLowerCase().includes('laptop') || cat?.id === '460d3a2e-6f44-4363-a457-f9323cbd7aff';
              const brandsToUse = isCar ? STATIC_CAR_BRANDS : isTruck ? STATIC_TRUCK_BRANDS : isRickshaw ? STATIC_RICKSHAW_BRANDS : isTractor ? STATIC_TRACTOR_BRANDS : isStandardBike ? STATIC_STANDARD_BIKE_BRANDS : isCruiser ? STATIC_CRUISER_BRANDS : isElectricBike ? STATIC_ELECTRIC_BIKE_BRANDS : isSportsHeavyBike ? STATIC_SPORTS_HEAVY_BIKE_BRANDS : isTrailBike ? STATIC_TRAIL_BIKE_BRANDS : isCafeRacer ? STATIC_CAFE_RACER_BRANDS : isElectricScooter ? STATIC_ELECTRIC_SCOOTER_BRANDS : isPetrolScooter ? STATIC_PETROL_SCOOTER_BRANDS : isMotorcycle ? STATIC_MOTORCYCLE_BRANDS : isBicycle ? STATIC_BICYCLE_BRANDS : isScooter ? STATIC_SCOOTER_BRANDS : isAtv ? STATIC_ATV_BRANDS : isConsole ? STATIC_CONSOLE_BRANDS : isTablet ? STATIC_TABLET_BRANDS : isLaptop ? STATIC_LAPTOP_BRANDS : isMonitor ? STATIC_MONITOR_BRANDS : isCamera ? STATIC_CAMERA_BRANDS : isTripod ? STATIC_TRIPOD_BRANDS : isVideoLight ? STATIC_VIDEOLIGHT_BRANDS : isVideoCamera ? STATIC_VIDEOCAMERA_BRANDS : isCameraBattery ? STATIC_CAMERABATTERY_BRANDS : isCctv ? STATIC_CCTV_BRANDS : isGimbal ? STATIC_GIMBAL_BRANDS : isDrone ? STATIC_DRONE_BRANDS : isCameraAcc ? STATIC_CAMERA_ACC_BRANDS : STATIC_BRANDS;
              setBrands(brandsToUse);
              setIsUsingStaticBrands(true);
              if (listing && listing.attributes?.brand) {
                const match = brandsToUse.find(b => b.name === listing.attributes.brand);
                if (match) {
                  setSelectedBrandId(match.id);
                } else {
                  setSelectedBrandId('manual-add-brand');
                  setIsManualBrand(true);
                  setManualBrandValue(listing.attributes.brand);
                }
              }
            } else {
              setBrands([]);
              setIsUsingStaticBrands(false);
            }
          }
          setBrandsLoading(false);
        });
    } else {
      setBrands([]);
      setModels([]);
      setSelectedBrandId('');
      setIsUsingStaticBrands(false);
    }
  }, [watchCategory, listing, allCategories]);

  // Fetch Models when selectedBrandId changes
  useEffect(() => {
    if (selectedBrandId) {
      // Check if we're using static brands
      if (isUsingStaticBrands) {
        // Use static models mapping
        const modelList = STATIC_MODELS[selectedBrandId] || ['Other Model'];
        // Add manual add option to the list
        const modelOptions = [
          ...modelList.map(m => ({ id: m, name: m })),
          { id: MANUAL_ADD_OPTION, name: '➕ Add Manually' }
        ];
        setModels(modelOptions);
        setModelsLoading(false);

        // Reset manual mode when brand changes
        setIsManualModel(false);
        setManualModelValue('');
      } else {
        // Fetch from Supabase
        setModelsLoading(true);
        supabase
          .from('category_field_options')
          .select('id, name')
          .eq('parent_id', selectedBrandId)
          .then(({ data, error }) => {
            // Ignore table-not-found errors (PGRST205) - table may not exist yet
            const tableNotFound = error?.code === 'PGRST205' || (error as any)?.status === 404;
            if (!error && !tableNotFound && data && data.length > 0) {
              // Add manual add option
              const modelOptions = [
                ...data.map(m => ({ id: m.id, name: m.name })),
                { id: MANUAL_ADD_OPTION, name: '➕ Add Manually' }
              ];
              setModels(modelOptions);
            } else {
              // If no models found, still show manual option
              setModels([{ id: MANUAL_ADD_OPTION, name: '➕ Add Manually' }]);
            }
            setModelsLoading(false);
            // Reset manual mode when brand changes
            setIsManualModel(false);
            setManualModelValue('');
          });
      }
    } else {
      setModels([]);
      setIsManualModel(false);
      setManualModelValue('');
    }
  }, [selectedBrandId, isUsingStaticBrands]);

  // Load categories
  useEffect(() => {
    categoriesService.getCategories()
      .then(data => {
        setAllCategories(data as unknown as Category[]);
        // If editing, resolve main/sub/sub-sub categories
        if (listing) {
          const currentCat = data.find(c => c.id === listing.category_id);
          if (currentCat) {
            if (!currentCat.parent_id) {
              setMainCat(currentCat);
            } else {
              const parent = data.find(p => p.id === currentCat.parent_id);
              if (parent && !parent.parent_id) {
                setMainCat(parent);
                setSubCat(currentCat);
              } else if (parent && parent.parent_id) {
                const grandParent = data.find(g => g.id === parent.parent_id);
                if (grandParent) {
                  if (!grandParent.parent_id) {
                    setMainCat(grandParent);
                    setSubCat(parent);
                    setSubSubCat(currentCat);
                  } else {
                    const greatGrandParent = data.find(gg => gg.id === grandParent.parent_id);
                    if (greatGrandParent) {
                      setMainCat(greatGrandParent);
                      setSubCat(grandParent);
                      setSubSubCat(parent);
                      setSubSubSubCat(currentCat);
                    }
                  }
                }
              }
            }
          }
        }
      })
      .catch(() => {
        setLoadError('Failed to load categories. Please reload.');
      })
      .finally(() => setCategoriesLoading(false));
  }, [listing]);



  // AI Price Suggestion
  useEffect(() => {
    if (watchTitle && mainCat && watchTitle.length > 5) {
      const timer = setTimeout(async () => {
        const suggestion = await aiService.suggestPrice(watchTitle, mainCat.name, dynamicAttrs);
        setAiPriceSuggestion(suggestion);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watchTitle, mainCat, dynamicAttrs]);

  // Initialize contact info and pre-fill user profile location if new listing
  useEffect(() => {
    if (listing) {
      if (listing.attributes?.contact_name) {
        setContactName(listing.attributes.contact_name);
      } else if (listing.seller?.full_name) {
        setContactName(listing.seller.full_name);
      }
      if (listing.attributes?.whatsapp_number) {
        setWhatsappNumber(listing.attributes.whatsapp_number);
      } else if (listing.attributes?.whatsapp) {
        setWhatsappNumber(listing.attributes.whatsapp);
      } else if (listing.seller?.phone) {
        setWhatsappNumber(listing.seller.phone);
      }
    } else if (user) {
      if (!contactName) {
        setContactName(user.full_name || '');
      }
      if (!whatsappNumber && user.phone) {
        setWhatsappNumber(user.phone || '');
      }
    }
  }, [user, listing]);

  // AI Title Generation
  const handleSuggestTitles = async () => {
    if (!watchTitle || watchTitle.length < 3) {
      toast.error('Please enter a draft title first.');
      return;
    }
    setSuggestingTitles(true);
    try {
      const suggestions = await aiService.suggestTitles(watchTitle, mainCat?.name || 'General');
      setAiTitles(suggestions);
      toast.success('AI title suggestions generated!');
    } catch {
      toast.error('Failed to get title suggestions');
    } finally {
      setSuggestingTitles(false);
    }
  };

  // AI Description Generator
  const handleGenerateDescription = async () => {
    if (!watchTitle || watchTitle.length < 5) {
      toast.error('Please enter a descriptive title first.');
      return;
    }
    setGeneratingDesc(true);
    try {
      const desc = await aiService.generateDescription(watchTitle, mainCat?.name || 'General', {
        condition: watch('condition') || 'good',
        ...dynamicAttrs
      });
      setValue('description', desc);
      toast.success('AI description generated successfully!');
    } catch {
      toast.error('Failed to generate description');
    } finally {
      setGeneratingDesc(false);
    }
  };

  // Spam detection trigger on step transition
  const handleSpamAnalysis = async () => {
    setAnalyzingSpam(true);
    try {
      const result = await aiService.detectSpam(watchTitle, watchDescription, watchPrice);
      setSpamAnalysis(result);
    } catch {
      setSpamAnalysis({ isSpam: false });
    } finally {
      setAnalyzingSpam(false);
    }
  };

  // Draft Auto-save recovery
  useEffect(() => {
    if (listing) return; // Don't auto-save or restore when editing existing
    const saved = localStorage.getItem('listing_post_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Do you want to restore your previous draft?</span>
              <div className="flex gap-2">
                <Button size="xs" onClick={() => {
                  Object.entries(draft.formData || {}).forEach(([key, value]) => {
                    if (key === 'subcategory_id' || key === 'sub_subcategory_id' || key === 'category_id') {
                      setValue(key as any, cleanUuid(value as string) || value);
                    } else {
                      setValue(key as any, value);
                    }
                  });
                  if (draft.mainCat) setMainCat({ ...draft.mainCat, id: cleanUuid(draft.mainCat.id) || draft.mainCat.id });
                  if (draft.subCat) setSubCat({ ...draft.subCat, id: cleanUuid(draft.subCat.id) || draft.subCat.id });
                  if (draft.subSubCat) setSubSubCat({ ...draft.subSubCat, id: cleanUuid(draft.subSubCat.id) || draft.subSubCat.id });
                  if (draft.subSubSubCat) setSubSubSubCat(draft.subSubSubCat);
                  if (draft.dynamicAttrs) setDynamicAttrs(draft.dynamicAttrs);
                  if (draft.contactName) setContactName(draft.contactName);
                  if (draft.whatsappNumber) setWhatsappNumber(draft.whatsappNumber);
                  
                  // Restore exact step/page
                  if (draft.currentStep !== undefined) {
                    setCurrentStep(draft.currentStep);
                  }

                  // Restore base64 images to file objects
                  if (Array.isArray(draft.base64Images) && draft.base64Images.length > 0) {
                    const restoredFiles = draft.base64Images.map((base64: string, index: number) => {
                      return dataURLtoFile(base64, `restored_image_${index + 1}.jpg`);
                    });
                    setImageFiles(restoredFiles);
                    
                    // Generate Object URLs for previews
                    const restoredPreviews = restoredFiles.map((file: File) => URL.createObjectURL(file));
                    setImages(restoredPreviews);
                  }

                  toast.dismiss(t.id);
                  toast.success('Draft restored!');
                }}>
                  Yes, Restore
                </Button>
                <Button size="xs" variant="secondary" onClick={() => {
                  localStorage.removeItem('listing_post_draft');
                  toast.dismiss(t.id);
                }}>
                  Discard
                </Button>
              </div>
            </div>
          ),
          {
            id: 'draft-recovery-toast',
            duration: Infinity
          }
        );
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, [setValue, listing]);

  // For Beauty & Personal Care products: lock condition to 'new'
  useEffect(() => {
    if (isBeautyCategory) {
      setValue('condition', 'new');
    }
  }, [isBeautyCategory, setValue]);

  // Draft Auto-save trigger
  useEffect(() => {
    if (listing) return;
    const interval = setInterval(async () => {
      const formValues = {
        title: watchTitle,
        description: watchDescription,
        price: watchPrice,
        category_id: watchCategory,
        subcategory_id: watch('subcategory_id'),
        sub_subcategory_id: watch('sub_subcategory_id'),
        condition: watch('condition'),
        city: watch('city'),
        location: watch('location'),
        is_negotiable: watch('is_negotiable')
      };

      const base64Images: string[] = [];
      for (const file of imageFiles) {
        try {
          const base64 = await compressImageToBase64(file);
          if (base64) base64Images.push(base64);
        } catch (e) {
          console.error('Error compressing file to base64', e);
        }
      }

      localStorage.setItem('listing_post_draft', JSON.stringify({
        formData: formValues,
        mainCat,
        subCat,
        subSubCat,
        subSubSubCat,
        dynamicAttrs,
        contactName,
        whatsappNumber,
        currentStep,
        base64Images
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [watchTitle, watchDescription, watchPrice, watchCategory, watch('subcategory_id'), watch('sub_subcategory_id'), watch('condition'), watch('city'), watch('location'), watch('is_negotiable'), mainCat, subCat, subSubCat, subSubSubCat, dynamicAttrs, contactName, whatsappNumber, currentStep, imageFiles, listing]);

  // Helper arrays
  const mainCategories = useMemo(() => allCategories.filter(c => !c.parent_id), [allCategories]);
  const subCategories = useMemo(() => {
    if (!mainCat) return [];

    // Override subcategories for Property for Sale (DB has old names)
    const isPropertyForSale = mainCat.id === 'c1000000-0000-0000-0000-000000000002' ||
      mainCat.slug === 'property-for-sale' || mainCat.slug === 'property' || mainCat.name === 'Property for Sale' || mainCat.name === 'Property';
    if (isPropertyForSale) {
      return [
        { id: '4c4a2d5d-7303-4b97-8e1e-775337fe894e', name: 'Land & Plots', slug: 'land-plots', icon: 'Map', color: '#8b5cf6', parent_id: mainCat.id } as Category,
        { id: '24e59436-fa5b-4fe6-898c-4ce34c4b901f', name: 'Houses', slug: 'houses', icon: 'Home', color: '#8b5cf6', parent_id: mainCat.id } as Category,
        { id: '9ef60e0a-9e89-4a78-86ef-5c9ea8b923dd', name: 'Apartments & Flats', slug: 'apartments-flats', icon: 'Building', color: '#8b5cf6', parent_id: mainCat.id } as Category,
        { id: '3f9d177a-5fc9-4a78-803e-111cbbd5831c', name: 'Shops - Offices - Commercial Space', slug: 'shops-offices-commercial-space', icon: 'Building2', color: '#8b5cf6', parent_id: mainCat.id } as Category,
        { id: 'a8dfa959-a83b-438c-8ffb-3faaa43b1626', name: 'Portions & Floors', slug: 'portions-floors', icon: 'Layers', color: '#8b5cf6', parent_id: mainCat.id } as Category,
      ];
    }

    const isPropertyForRent = mainCat.id === 'c1000000-0000-0000-0000-000000000015' ||
      mainCat.slug === 'property-for-rent' || mainCat.name === 'Property for Rent';
    if (isPropertyForRent) {
      return [
        { id: 'd1000000-0000-0000-0000-000000000101', name: 'Houses', slug: 'rent-houses', icon: 'Home', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000102', name: 'Apartments & Flats', slug: 'rent-apartments-flats', icon: 'Building', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000103', name: 'Portions & Floors', slug: 'rent-portions-floors', icon: 'Layers', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000104', name: 'Shops - Offices - Commercial Space', slug: 'rent-shops-offices-commercial-space', icon: 'Building2', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000105', name: 'Rooms', slug: 'rent-rooms', icon: 'DoorOpen', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000106', name: 'Roommates & Paying Guests', slug: 'rent-roommates-paying-guests', icon: 'Users', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000107', name: 'Vacation Rentals - Guest Houses', slug: 'rent-vacation-guest-houses', icon: 'Hotel', color: '#7c3aed', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000108', name: 'Land & Plots', slug: 'rent-land-plots', icon: 'Map', color: '#7c3aed', parent_id: mainCat.id } as Category,
      ];
    }

    const isAnimals = mainCat.id === 'c1000000-0000-0000-0000-000000000009' ||
      mainCat.slug === 'animals' || mainCat.slug === 'pets' || mainCat.name === 'Animals' || mainCat.name === 'Pets';
    if (isAnimals) {
      return [
        { id: 'd1000000-0000-0000-0000-000000000b01', name: 'Hens', slug: 'hens', icon: 'Egg', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b02', name: 'Parrots', slug: 'parrots', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b03', name: 'Livestock', slug: 'livestock', icon: 'Beef', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'c1000000-0000-0000-0000-000000000148', name: 'Cats', slug: 'cats', icon: 'Cat', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'c1000000-0000-0000-0000-000000000151', name: 'Pet Food & Accessories', slug: 'pet-food-accessories', icon: 'ShoppingBag', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'c1000000-0000-0000-0000-000000000147', name: 'Dogs', slug: 'dogs', icon: 'PawPrint', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b07', name: 'Pigeons', slug: 'pigeons', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b08', name: 'Rabbits', slug: 'rabbits', icon: 'Rabbit', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b09', name: 'Finches', slug: 'finches', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'c1000000-0000-0000-0000-000000000150', name: 'Fish', slug: 'fish', icon: 'Fish', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b11', name: 'Other Birds', slug: 'other-birds', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b12', name: 'Fertile Eggs', slug: 'fertile-eggs', icon: 'Egg', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b13', name: 'Ducks', slug: 'ducks', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b14', name: 'Other Animals', slug: 'other-animals', icon: 'PawPrint', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b15', name: 'Doves', slug: 'doves', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b16', name: 'Peacocks', slug: 'peacocks', icon: 'Bird', color: '#f97316', parent_id: mainCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000b17', name: 'Horses', slug: 'horses', icon: 'PawPrint', color: '#f97316', parent_id: mainCat.id } as Category,
      ];
    }

    return allCategories.filter(c => c.parent_id === mainCat.id);
  }, [allCategories, mainCat]);
  const subSubCategories = useMemo(() => {
    if (!subCat) return [];
    const dbSubSub = allCategories.filter(c => c.parent_id === subCat.id);
    if (dbSubSub.length > 0) return dbSubSub;

    const isScooters = subCat.slug === 'scooters' || subCat.name === 'Scooters' || subCat.slug === 'scooters-scooty' || subCat.name === 'Scooters & Scooty';
    if (isScooters) {
      return [
        { id: 'c1000000-0000-0000-0000-000000000371', name: 'Petrol', slug: 'petrol-scooters', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'c1000000-0000-0000-0000-000000000372', name: 'Electric', slug: 'electric-scooters', icon: 'Zap', color: '#f97316', parent_id: subCat.id } as Category
      ];
    }

    const isBicycles = subCat.slug === 'bicycles' || subCat.name === 'Bicycles' || subCat.id === '4a00ceef-1ea9-45c3-9517-bdb62320e8d1';
    if (isBicycles) {
      return [
        { id: 'bc-road-bikes', name: 'Road Bikes', slug: 'road-bikes', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-mountain-bikes', name: 'Mountain Bikes', slug: 'mountain-bikes', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-hybrid-bikes', name: 'Hybrid Bikes', slug: 'hybrid-bikes', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-bmx-bikes', name: 'BMX Bikes', slug: 'bmx-bikes', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-electric-bicycles', name: 'Electric Bicycles', slug: 'electric-bicycles', icon: 'Zap', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-folding-bikes', name: 'Folding Bikes', slug: 'folding-bikes', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'bc-other-bicycles', name: 'Other Bicycles', slug: 'other-bicycles', icon: 'Bike', color: '#f97316', parent_id: subCat.id } as Category
      ];
    }

    const isSpareParts = subCat.slug === 'bike-spare-parts' || subCat.name === 'Spare Parts' || subCat.id === 'c1000000-0000-0000-0000-000000000351';
    if (isSpareParts) {
      return [
        { id: 'sp-air-filters', name: 'Air Filters', slug: 'air-filters', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-carburetors', name: 'Carburetors', slug: 'carburetors', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-bearings', name: 'Bearings', slug: 'bearings', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-side-mirrors', name: 'Side Mirrors', slug: 'side-mirrors', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-motorcycle-batteries', name: 'Motorcycle Batteries', slug: 'motorcycle-batteries', icon: 'Zap', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-switches', name: 'Switches', slug: 'switches', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-lighting', name: 'Lighting', slug: 'lighting', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-cylinders', name: 'Cylinders', slug: 'cylinders', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-clutches', name: 'Clutches', slug: 'clutches', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-pistons', name: 'Pistons', slug: 'pistons', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-chain-covers-sprockets', name: 'Chain, Covers & Sprockets', slug: 'chain-covers-sprockets', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-brakes', name: 'Brakes', slug: 'brakes', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-handle-bars-grips', name: 'Handle Bars & Grips', slug: 'handle-bars-grips', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-levers', name: 'Levers', slug: 'levers', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-seats', name: 'Seats', slug: 'seats', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-exhausts', name: 'Exhausts', slug: 'exhausts', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-fuel-tanks', name: 'Fuel Tanks', slug: 'fuel-tanks', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-horns', name: 'Horns', slug: 'horns', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-speedometers', name: 'Speedometers', slug: 'speedometers', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-plugs', name: 'Plugs', slug: 'plugs', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-stands', name: 'Stands', slug: 'stands', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-tyres-tubes', name: 'Tyres & Tubes', slug: 'tyres-tubes', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-silencer', name: 'Silencer', slug: 'silencer', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-transmission', name: 'Transmission', slug: 'transmission', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-steering-suspension', name: 'Steering & Suspension', slug: 'steering-suspension', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-body-frame', name: 'Body & Frame', slug: 'body-frame', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'sp-other-spare-parts', name: 'Other Spare Parts', slug: 'other-spare-parts', icon: 'Settings', color: '#f97316', parent_id: subCat.id } as Category
      ];
    }

    const isBikesAccessories = subCat.slug === 'bike-accessories' || subCat.name === 'Bikes Accessories' || subCat.id === 'c1000000-0000-0000-0000-000000000352';
    if (isBikesAccessories) {
      return [
        { id: 'ba-bicycle-air-pumps', name: 'Bicycle Air Pumps', slug: 'bicycle-air-pumps', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-oils-lubricants', name: 'Oils / Lubricants', slug: 'oils-lubricants', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bike-covers', name: 'Bike Covers', slug: 'bike-covers', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bike-gloves', name: 'Bike Gloves', slug: 'bike-gloves', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-helmets', name: 'Helmets', slug: 'helmets', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-tail-boxes', name: 'Tail Boxes', slug: 'tail-boxes', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bike-jackets', name: 'Bike Jackets', slug: 'bike-jackets', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bike-locks', name: 'Bike Locks', slug: 'bike-locks', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-safe-guards', name: 'Safe Guards', slug: 'safe-guards', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-sticker-emblems', name: 'Sticker & Emblems', slug: 'sticker-emblems', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-mobile-chargers', name: 'Mobile chargers', slug: 'mobile-chargers', icon: 'Zap', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bike-shoes', name: 'Bike Shoes', slug: 'bike-shoes', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-bluetooth-headsets', name: 'Bluetooth Headsets', slug: 'bluetooth-headsets', icon: 'Headphones', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-safety-security', name: 'Safety & Security', slug: 'safety-security', icon: 'Shield', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'ba-other-bike-accessories', name: 'Other Bike Accessories', slug: 'other-bike-accessories', icon: 'Sliders', color: '#f97316', parent_id: subCat.id } as Category
      ];
    }

    const isComputersCategory = subCat.id === 'd1000000-0000-0000-0000-000000000201' ||
      subCat.id === 'c1000000-0000-0000-0000-000000000115' ||
      subCat.slug === 'computers-accessories' ||
      subCat.slug === 'computers' ||
      subCat.name === 'Computers & Accessories' ||
      subCat.name === 'Computers';

    if (isComputersCategory) {
      return [
        { id: 'd1000000-0000-0000-0000-000000000701', name: 'Servers', slug: 'servers', icon: 'Server', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000702', name: 'Softwares', slug: 'softwares', icon: 'Code', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000703', name: 'Gaming PCs', slug: 'gaming-pcs', icon: 'Gamepad2', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000704', name: 'Networking', slug: 'networking', icon: 'Wifi', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000705', name: 'Printers & Photocopiers', slug: 'printers-photocopiers', icon: 'Printer', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000706', name: 'Inks & Toners', slug: 'inks-toners', icon: 'Droplet', color: '#3b82f6', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000707', name: '3D Printers & Accessories', slug: '3d-printers-accessories', icon: 'Box', color: '#3b82f6', parent_id: subCat.id } as Category,
      ];
    }

    const isLivestock = subCat.id === 'd1000000-0000-0000-0000-000000000b03' ||
      subCat.slug === 'livestock' || subCat.name === 'Livestock';
    if (isLivestock) {
      return [
        { id: 'd1000000-0000-0000-0000-000000000c01', name: 'Buffalos', slug: 'buffalos', icon: 'Beef', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c02', name: 'Bulls', slug: 'bulls', icon: 'Beef', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c03', name: 'Camels', slug: 'camels', icon: 'PawPrint', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c04', name: 'Cows', slug: 'cows', icon: 'Beef', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c05', name: 'Goats', slug: 'goats', icon: 'Beef', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c06', name: 'Sheep', slug: 'sheep', icon: 'Beef', color: '#f97316', parent_id: subCat.id } as Category,
        { id: 'd1000000-0000-0000-0000-000000000c07', name: 'Others', slug: 'other-livestock', icon: 'PawPrint', color: '#f97316', parent_id: subCat.id } as Category,
      ];
    }

    return [];
  }, [allCategories, subCat]);

  const subSubSubCategories = useMemo(() => {
    if (!subSubCat) return [];
    return allCategories.filter(c => c.parent_id === subSubCat.id);
  }, [allCategories, subSubCat]);

  const activeAttributesSchema = useMemo(() => {
    const active = subSubSubCat || subSubCat || subCat || mainCat;
    if (!active || isCarCategoryOrInstallments || isTruckCategory || isHeavyMachineryCategory || isRickshawCategory || isTractorCategory || isBoatsCategory || isMotorcycleCategory || isBicycleCategory || isScooterCategory || isAtvCategory || isBikeCareOrPartsCategory || isServicesCategory || isBusinessCategory) return [];

    const isMobile = !isBusinessCategory && !isServicesCategory && !isJobsCategory && (
      (active.slug?.includes('mobile') && active.slug !== 'mobile-shops' && !active.slug?.includes('mobile-shop')) ||
      active.slug?.includes('phone') ||
      (active.name?.toLowerCase().includes('phone') && !active.name?.toLowerCase().includes('mobile shop')) ||
      active.name?.toLowerCase().includes('tablet')
    );

    let schema = [];
    try {
      schema = (active as any).attributes_schema || [];
    } catch {
      schema = [];
    }

    // Fallback schema for Mobile Phones & Tablets if empty
    if (isMobile && schema.length === 0) {
      const isTablet = active.slug?.includes('tablet') ||
        active.name?.toLowerCase().includes('tablet') ||
        active.id === 'c1000000-0000-0000-0000-000000000113';

      if (isTablet) {
        schema = [
          { name: 'brand', label: 'Brand', type: 'select', required: true },
          { name: 'pta_status', label: 'PTA Status', type: 'select', required: true },
          { name: 'ram', label: 'RAM', type: 'select', options: ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'], required: true },
          { name: 'storage', label: 'Storage', type: 'select', options: ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], required: true },
          { name: 'color', label: 'Color', type: 'text', required: false },
          { name: 'warranty', label: 'Warranty', type: 'select', options: ['No Warranty', 'Local Warranty', 'International Warranty'], required: false }
        ];
      } else {
        schema = [
          { name: 'brand', label: 'Brand', type: 'select', required: true },
          { name: 'model', label: 'Model', type: 'select', required: true },
          { name: 'pta_status', label: 'PTA Status', type: 'select', required: true },
          { name: 'ram', label: 'RAM', type: 'select', options: ['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'], required: true },
          { name: 'storage', label: 'Storage', type: 'select', options: ['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], required: true },
          { name: 'color', label: 'Color', type: 'text', required: false },
          { name: 'warranty', label: 'Warranty', type: 'select', options: ['No Warranty', 'Local Warranty', 'International Warranty'], required: false }
        ];
      }
    }

    return schema;
  }, [mainCat, subCat, subSubCat, subSubSubCat]);

  const handleSelectMainCategory = (cat: Category) => {
    setMainCat(cat);
    setSubCat(null);
    setSubSubCat(null);
    setSubSubSubCat(null);
    setValue('category_id', cat.id);
    setValue('subcategory_id', '');
    setValue('sub_subcategory_id', '');
    setDynamicAttrs({});
  };

  const handleSelectSubCategory = (cat: Category) => {
    setSubCat(cat);
    setSubSubCat(null);
    setSubSubSubCat(null);
    setValue('subcategory_id', cat.id);
    setValue('category_id', cat.id);
    setValue('sub_subcategory_id', '');
    setDynamicAttrs({});
  };

  const handleSelectSubSubCategory = (cat: Category) => {
    setSubSubCat(cat);
    setSubSubSubCat(null);
    setValue('sub_subcategory_id', cat.id);
    if (allCategories.some(c => c.id === cat.id)) {
      setValue('category_id', cat.id);
    } else if (subCat && allCategories.some(c => c.id === subCat.id)) {
      setValue('category_id', subCat.id);
    } else if (mainCat && allCategories.some(c => c.id === mainCat.id)) {
      setValue('category_id', mainCat.id);
    }
    setDynamicAttrs({});
  };

  const handleSelectSubSubSubCategory = (cat: Category) => {
    setSubSubSubCat(cat);
    if (allCategories.some(c => c.id === cat.id)) {
      setValue('category_id', cat.id);
    }
    setDynamicAttrs({});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach(file => {
      const error = validateImageFile(file);
      if (error) { toast.error(error); return; }
      if (images.length + validFiles.length >= 10) { toast.error('Maximum 10 images allowed'); return; }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    setImageFiles(prev => [...prev, ...validFiles]);
    setImages(prev => [...prev, ...validPreviews]);
    e.target.value = '';
  };

  // Reordering functions
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    // Swap previews
    const newImages = [...images];
    const tempImg = newImages[index];
    newImages[index] = newImages[newIdx];
    newImages[newIdx] = tempImg;
    setImages(newImages);

    // Swap files (only if they are new uploads at matching indices)
    const newFiles = [...imageFiles];
    // Simple swap logic for files
    const localIndex = index - (images.length - imageFiles.length);
    const localNewIdx = newIdx - (images.length - imageFiles.length);
    if (localIndex >= 0 && localNewIdx >= 0) {
      const tempFile = newFiles[localIndex];
      newFiles[localIndex] = newFiles[localNewIdx];
      newFiles[localNewIdx] = tempFile;
      setImageFiles(newFiles);
    }
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const cover = newImages.splice(index, 1)[0];
    newImages.unshift(cover);
    setImages(newImages);

    const localIdx = index - (images.length - imageFiles.length);
    if (localIdx > 0 && localIdx < imageFiles.length) {
      const newFiles = [...imageFiles];
      const coverFile = newFiles.splice(localIdx, 1)[0];
      newFiles.unshift(coverFile);
      setImageFiles(newFiles);
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    const localIdx = idx - (images.length - imageFiles.length);
    if (localIdx >= 0) {
      setImageFiles(prev => prev.filter((_, i) => i !== localIdx));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateVideoFile(file);
    if (error) { toast.error(error); return; }
    setVideoFile(file);
    setVideo(URL.createObjectURL(file));
    e.target.value = '';
  };

  // Handle model selection - including manual add
  const handleModelSelect = (modelId: string) => {
    if (modelId === MANUAL_ADD_OPTION) {
      setIsManualModel(true);
      setManualModelValue('');
      // Don't set the model in attributes yet
      setDynamicAttrs(prev => ({ ...prev, model: '' }));
    } else {
      setIsManualModel(false);
      const selectedModel = models.find(m => m.id === modelId);
      if (selectedModel) {
        setDynamicAttrs(prev => ({ ...prev, model: selectedModel.name }));
      }
    }
  };

  // Handle manual model input change
  const handleManualModelChange = (value: string) => {
    setManualModelValue(value);
    setDynamicAttrs(prev => ({ ...prev, model: value }));
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      if (!mainCat) {
        toast.error('Please select a category first.');
        return;
      }
      if (subCategories.length > 0 && !subCat) {
        toast.error('Please select a subcategory.');
        return;
      }
      if (subSubCategories.length > 0 && !subSubCat) {
        toast.error('Please select a sub-subcategory.');
        return;
      }
      if (subSubSubCategories.length > 0 && !subSubSubCat) {
        toast.error('Please select an accessory / part type.');
        return;
      }
    }
    if (currentStep === 1) {
      // Validate basic text validation
      if (!watchTitle || watchTitle.length < 5) {
        toast.error('Title must be at least 5 characters');
        return;
      }
      if (!watchDescription || watchDescription.length < 20) {
        toast.error('Description must be at least 20 characters');
        return;
      }

      // Add custom validation for digital cameras type & brand
      const isCamera = subSubCat?.slug?.includes('digital-camera') ||
        subSubCat?.name?.toLowerCase().includes('digital camera') ||
        subSubCat?.name?.toLowerCase().includes('digital-camera');

      const isCameraAcc = subSubCat?.slug?.includes('camera-and-lenses-accessories') ||
        subSubCat?.name === 'Camera & Lenses Accessories';

      const isCharger = subSubCat?.slug?.includes('chargers') ||
        subSubCat?.name === 'Chargers' ||
        subSubCat?.slug === 'acc-chargers';

      const isCable = subSubCat?.slug?.includes('charging-cables') ||
        subSubCat?.name === 'Charging Cables' ||
        subSubCat?.slug === 'acc-charging-cables';

      const isCase = subSubCat?.slug?.includes('covers-and-cases') ||
        subSubCat?.name === 'Covers & Cases' ||
        subSubCat?.slug === 'acc-covers-and-cases';

      const isProtector = subSubCat?.slug?.includes('screen-protectors') ||
        subSubCat?.name === 'Screen Protectors' ||
        subSubCat?.slug === 'acc-screen-protectors';

      if (isCamera || isCameraAcc || isCharger || isCable || isCase || isProtector) {
        if (isCharger && !dynamicAttrs.device_type) {
          toast.error('Device Type is required');
          return;
        }
        if (!dynamicAttrs.type) {
          toast.error('Type is required');
          return;
        }
        if (!isCharger && !isCable && !isCase && !isProtector && !dynamicAttrs.brand) {
          toast.error('Brand is required');
          return;
        }
      }

      const isLaptop = subCat?.slug?.includes('laptop') ||
        subCat?.name?.toLowerCase().includes('laptop') ||
        subCat?.id === '460d3a2e-6f44-4363-a457-f9323cbd7aff';

      if (isLaptop) {
        if (!dynamicAttrs.type) {
          toast.error('Laptop Type is required');
          return;
        }
        if (!dynamicAttrs.brand) {
          toast.error('Laptop Brand is required');
          return;
        }
        if (!dynamicAttrs.generation) {
          toast.error('Laptop Generation is required');
          return;
        }
        if (!dynamicAttrs.core) {
          toast.error('Laptop Processor (Core) is required');
          return;
        }
        if (!dynamicAttrs.ram) {
          toast.error('Laptop RAM is required');
          return;
        }
        if (!dynamicAttrs.storage) {
          toast.error('Laptop Storage is required');
          return;
        }
      }

      if (isCarCategoryOrInstallments) {
        if (!dynamicAttrs.brand) {
          toast.error('Make is required');
          return;
        }
        if (!dynamicAttrs.model) {
          toast.error('Model is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
        if (!dynamicAttrs.fuel) {
          toast.error('Fuel is required');
          return;
        }
        if (!dynamicAttrs.transmission) {
          toast.error('Transmission is required');
          return;
        }
        if (!dynamicAttrs.body_type) {
          toast.error('Body Type is required');
          return;
        }
        if (!dynamicAttrs.color) {
          toast.error('Color is required');
          return;
        }
        if (!dynamicAttrs.features) {
          toast.error('Features are required');
          return;
        }
        if (!dynamicAttrs.documents) {
          toast.error('Car documents are required');
          return;
        }
        if (!dynamicAttrs.assembly) {
          toast.error('Assembly is required');
          return;
        }
        if (isCarsOnInstallments) {
          if (!dynamicAttrs.monthly_installment) {
            toast.error('Monthly installment is required');
            return;
          }
          if (!dynamicAttrs.installment_plan) {
            toast.error('Installment plan is required');
            return;
          }
        }
      }

      if (isTruckCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Make is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
        if (!dynamicAttrs.km_driven) {
          toast.error("KM's driven is required");
          return;
        }
      }

      if (isHeavyMachineryCategory) {
        if (!dynamicAttrs.type) {
          toast.error('Type is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
      }

      if (isRickshawCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Make is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
        if (!dynamicAttrs.km_driven) {
          toast.error("KM's driven is required");
          return;
        }
      }

      if (isTractorCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Make is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
        if (!dynamicAttrs.km_driven) {
          toast.error("KM's driven is required");
          return;
        }
      }

      if (isBoatsCategory) {
        if (!dynamicAttrs.type) {
          toast.error('Type is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
      }

      if (isMotorcycleCategory || isScooterCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Make is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
        if (!dynamicAttrs.fuel) {
          toast.error('Fuel is required');
          return;
        }
        if (!dynamicAttrs.km_driven) {
          toast.error("KM's driven is required");
          return;
        }
      }

      if (isAtvCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Brand is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.year) {
          toast.error('Year is required');
          return;
        }
      }

      if (isBicycleCategory) {
        if (!dynamicAttrs.brand) {
          toast.error('Brand is required');
          return;
        }
        if (!watch('condition')) {
          toast.error('Condition is required');
          return;
        }
        if (!dynamicAttrs.type) {
          toast.error('Bicycle Type is required');
          return;
        }
      }
      // Check category-specific attributes required validation
      let hasError = false;
      activeAttributesSchema.forEach((attr: any) => {
        if (attr.required && !dynamicAttrs[attr.name]) {
          toast.error(`${attr.label} is required.`);
          hasError = true;
        }
      });
      if (hasError) return;
    }
    if (currentStep === 2 && images.length === 0) {
      toast.error('Please upload at least one product photo.');
      return;
    }
    if (currentStep === 3) {
      const selectedCity = watch('city');
      if (!selectedCity) {
        toast.error('Location is required');
        return;
      }
      if (watchPrice === undefined || watchPrice < 0) {
        toast.error('Price cannot be negative');
        return;
      }
      if (!contactName.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!whatsappNumber.trim()) {
        toast.error('Add WhatsApp Number is required');
        return;
      }
      // Trigger AI Spam Analysis
      await handleSpamAnalysis();
    }

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;
    if (spamAnalysis?.isSpam) {
      toast.error('Spam scan detected policy violations. Please adjust details before submitting.');
      return;
    }

    // Split the unified location string (data.city) into finalCity and finalLocation
    const [cityPart, ...areaParts] = data.city.split(',');
    const finalCity = cityPart ? cityPart.trim() : '';
    const finalLocation = areaParts.length > 0 ? areaParts.join(',').trim() : '';

    if (!finalCity) {
      toast.error('Location is required.');
      return;
    }

    setUploading(true);
    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await listingsService.uploadImage(file, user.id);
        uploadedUrls.push(url);
      }

      // Combine existing and new image URLs
      const existingUrls = images.filter(img => img.startsWith('http'));
      const finalImages = [...existingUrls, ...uploadedUrls];

      // Upload video if any
      let videoUrl = video?.startsWith('http') ? video : null;
      if (videoFile) {
        videoUrl = await listingsService.uploadVideo(videoFile, user.id);
      }

      // Ensure category_id, subcategory_id, and sub_subcategory_id ONLY contain valid DB category UUIDs
      let finalCategoryId = cleanUuid(mainCat?.id) || cleanUuid(subCat?.id) || cleanUuid(subSubCat?.id) || cleanUuid(data.category_id) || 'c1000000-0000-0000-0000-000000000002';
      let finalSubcategoryId = cleanUuid(subCat?.id) !== finalCategoryId ? cleanUuid(subCat?.id) : undefined;
      let finalSubSubcategoryId = cleanUuid(subSubCat?.id) !== finalCategoryId ? cleanUuid(subSubCat?.id) : undefined;

      const listingData = {
        ...data,
        condition: isBeautyCategory ? 'new' : data.condition || 'good',
        category_id: finalCategoryId,
        subcategory_id: finalSubcategoryId,
        sub_subcategory_id: finalSubSubcategoryId,
        city: finalCity,
        location: finalLocation || undefined,
        seller_id: user.id,
        images: finalImages,
        video_url: videoUrl || undefined,
        status: listing 
          ? (['suspended', 'rejected', 'changes_requested'].includes(listing.status) ? 'pending' : listing.status)
          : ('pending' as const),
        country: 'Pakistan',
        views_count: 0,
        attributes: {
          ...dynamicAttrs,
          virtual_category_id: mainCat?.id || undefined,
          virtual_subcategory_id: subCat?.id || undefined,
          virtual_sub_subcategory_id: subSubCat?.id || undefined,
          subcategory_name: subCat?.name || undefined,
          sub_subcategory_name: subSubCat?.name || undefined,
          contact_name: contactName,
          whatsapp_number: whatsappNumber.trim(),
          whatsapp: whatsappNumber.trim(),
          suspension_reason: undefined,
          rejection_reason: undefined,
          changes_reason: undefined
        }
      };

      let result: Listing;
      if (listing) {
        result = await listingsService.updateListing(listing.id, listingData);
        toast.success('Listing updated successfully!');
      } else {
        result = await listingsService.createListing(listingData);
        toast.success('Your listing has been submitted successfully and will be reviewed within 2–3 working days.');
        // Clean draft
        localStorage.removeItem('listing_post_draft');
      }

      onSuccess(result);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to submit listing');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Wizard Bar */}
      <div className="card p-4 bg-gradient-to-r from-primary-900/10 via-surface to-surface">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 relative">
                <button
                  type="button"
                  onClick={() => idx < currentStep && setCurrentStep(idx)}
                  disabled={idx > currentStep}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${idx === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                    : idx < currentStep
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                >
                  {idx < currentStep ? <CheckCircle2 size={16} /> : idx + 1}
                </button>
                <span className={`text-xs font-medium ${idx === currentStep ? 'text-primary-600 font-bold' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${idx < currentStep ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Forms Area */}
      <div>
        {/* STEP 0: Category Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Choose Category</h2>
              </div>
              {categoriesLoading ? (
                <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-primary-500" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Main Categories Grid */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Main Category</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {mainCategories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectMainCategory(cat)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center hover:scale-[1.02] ${mainCat?.id === cat.id
                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                            : 'border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300'
                            }`}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: cat.color ? cat.color + '15' : '#3b82f615' }}>
                            <Icon name={cat.icon || 'Tag'} size={24} style={{ color: cat.color || '#3b82f6' }} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subcategories (If Available) */}
                  {mainCat && subCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Subcategory</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {subCategories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectSubCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${subCat?.id === cat.id
                              ? 'border-primary-500 bg-primary-600 text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-subcategories (If Available) */}
                  {subCat && subSubCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Sub-Subcategory</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {subSubCategories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectSubSubCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${subSubCat?.id === cat.id
                              ? 'border-primary-500 bg-primary-600 text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub-sub-subcategories (If Available) */}
                  {subSubCat && subSubSubCategories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Accessory / Part Type</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {subSubSubCategories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectSubSubSubCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${subSubSubCat?.id === cat.id
                              ? 'border-primary-500 bg-primary-600 text-white'
                              : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                              }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Ad Information & Dynamic Form */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="card p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Ad Specifications for <span className="text-primary-600">{subSubCat?.name || subCat?.name || mainCat?.name}</span>
                </h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 px-3 py-1.5 rounded-full font-medium">
                  {mainCat?.name} {subCat && `> ${subCat.name}`} {subSubCat && `> ${subSubCat.name}`}
                </span>
              </div>

              {/* Brand & Model Searchable Selects */}
              {brands.length > 0 && !isBusinessCategory && !isServicesCategory && (() => {
                const isTabletCategory = subCat?.slug?.includes('tablet') ||
                  subCat?.name?.toLowerCase().includes('tablet') ||
                  subCat?.id === 'c1000000-0000-0000-0000-000000000113';

                const isLaptopCategory = subCat?.slug?.includes('laptop') ||
                  subCat?.name?.toLowerCase().includes('laptop') ||
                  subCat?.id === '460d3a2e-6f44-4363-a457-f9323cbd7aff';

                const isMonitorCategory = subSubCat?.slug === 'computers-monitors' ||
                  subSubCat?.name === 'Monitors' ||
                  subSubCat?.id === '7f2c7382-fb48-48dd-9895-95cb02f9b1b9';

                const isDigitalCameraCategory = subSubCat?.slug?.includes('digital-camera') ||
                  subSubCat?.name?.toLowerCase().includes('digital camera') ||
                  subSubCat?.name?.toLowerCase().includes('digital-camera');

                const isCctvCategory = subSubCat?.slug?.includes('cctv-cameras') ||
                  subSubCat?.name?.toLowerCase().includes('cctv');

                const isCameraAccCategory = subSubCat?.slug?.includes('camera-and-lenses-accessories') ||
                  subSubCat?.name === 'Camera & Lenses Accessories';

                const isCameraCategory = isDigitalCameraCategory ||
                  subSubCat?.slug?.includes('camera-lenses') ||
                  subSubCat?.name?.toLowerCase().includes('camera lenses') ||
                  subSubCat?.slug?.includes('tripods-and-stands') ||
                  subSubCat?.name === 'Tripods & Stands' ||
                  subSubCat?.slug?.includes('video-lights') ||
                  subSubCat?.name === 'Video Lights' ||
                  subSubCat?.slug?.includes('video-cameras') ||
                  subSubCat?.name === 'Video Cameras' ||
                  subSubCat?.slug?.includes('camera-batteries') ||
                  subSubCat?.name === 'Camera Batteries' ||
                  subSubCat?.slug?.includes('drones') ||
                  subSubCat?.name === 'Drones' ||
                  isCameraAccCategory ||
                  isChargerCategory ||
                  isCableCategory ||
                  isCaseCategory ||
                  isProtectorCategory ||
                  isCctvCategory;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/50 dark:bg-slate-700/10 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <div className="col-span-full">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Device Specifications</h3>
                    </div>

                    {/* Laptop Type selection */}
                    {isLaptopCategory && (
                      <div className="space-y-2">
                        <label className="label text-sm font-semibold">Type *</label>
                        {isManualLaptopType ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter custom type name..."
                              value={manualLaptopTypeValue}
                              onChange={(e) => {
                                setManualLaptopTypeValue(e.target.value);
                                setDynamicAttrs(prev => ({ ...prev, type: e.target.value }));
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setIsManualLaptopType(false);
                                setManualLaptopTypeValue('');
                                setSelectedLaptopTypeId('');
                                setDynamicAttrs(prev => ({ ...prev, type: '' }));
                              }}
                              className="shrink-0"
                            >
                              <X size={14} /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <select
                            className="input text-sm cursor-pointer"
                            value={selectedLaptopTypeId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedLaptopTypeId(val);
                              if (val === 'manual-add-type') {
                                setIsManualLaptopType(true);
                                setManualLaptopTypeValue('');
                                setDynamicAttrs(prev => ({ ...prev, type: '' }));
                              } else {
                                setIsManualLaptopType(false);
                                const typeName = STATIC_LAPTOP_TYPES.find(t => t.id === val)?.name || '';
                                setDynamicAttrs(prev => ({ ...prev, type: typeName }));
                              }
                            }}
                          >
                            <option value="">Select laptop type...</option>
                            {STATIC_LAPTOP_TYPES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {!isManualLaptopType && dynamicAttrs.type && (
                          <p className="text-xs text-slate-400 mt-1">
                            Selected Type: <strong>{dynamicAttrs.type}</strong>
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          {/* Generation selection */}
                          <div className="space-y-2">
                            <label className="label text-sm font-semibold">Generation *</label>
                            <select
                              className="input text-sm cursor-pointer"
                              value={dynamicAttrs.generation || ''}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, generation: e.target.value }))}
                            >
                              <option value="">Select Generation</option>
                              {STATIC_LAPTOP_GENERATIONS.map(gen => (
                                <option key={gen} value={gen}>{gen}</option>
                              ))}
                            </select>
                          </div>

                          {/* Core selection */}
                          <div className="space-y-2">
                            <label className="label text-sm font-semibold">Processor (Core) *</label>
                            <select
                              className="input text-sm cursor-pointer"
                              value={dynamicAttrs.core || ''}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, core: e.target.value }))}
                            >
                              <option value="">Select Core</option>
                              {STATIC_LAPTOP_CORES.map(core => (
                                <option key={core} value={core}>{core}</option>
                              ))}
                            </select>
                          </div>

                          {/* RAM selection */}
                          <div className="space-y-2">
                            <label className="label text-sm font-semibold">RAM *</label>
                            <select
                              className="input text-sm cursor-pointer"
                              value={dynamicAttrs.ram || ''}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, ram: e.target.value }))}
                            >
                              <option value="">Select RAM</option>
                              {STATIC_LAPTOP_RAMS.map(ram => (
                                <option key={ram} value={ram}>{ram}</option>
                              ))}
                            </select>
                          </div>

                          {/* Storage selection */}
                          <div className="space-y-2">
                            <label className="label text-sm font-semibold">Storage *</label>
                            <select
                              className="input text-sm cursor-pointer"
                              value={dynamicAttrs.storage || ''}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, storage: e.target.value }))}
                            >
                              <option value="">Select Storage</option>
                              {STATIC_LAPTOP_STORAGES.map(storage => (
                                <option key={storage} value={storage}>{storage}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Camera Type selection */}
                    {isDigitalCameraCategory && (
                      <div className="space-y-2">
                        <SearchableSelect
                          label="Type *"
                          options={STATIC_CAMERA_TYPES.map(t => ({ value: t.id, label: t.name }))}
                          value={selectedCameraTypeId}
                          onChange={(typeId) => {
                            setSelectedCameraTypeId(typeId);
                            if (typeId === 'manual-add-type') {
                              setIsManualCameraType(true);
                              setManualCameraTypeValue('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            } else {
                              setIsManualCameraType(false);
                              const typeName = STATIC_CAMERA_TYPES.find(t => t.id === typeId)?.name || '';
                              setDynamicAttrs(prev => ({ ...prev, type: typeName }));
                            }
                          }}
                          placeholder="Select type..."
                        />
                      </div>
                    )}

                    {/* Camera Type Manual Entry */}
                    {isDigitalCameraCategory && isManualCameraType && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Enter Type Manually *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualCameraType(false);
                              setManualCameraTypeValue('');
                              setSelectedCameraTypeId('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                        <Input
                          placeholder="e.g. Cinema Camera, Rangefinder etc."
                          value={manualCameraTypeValue}
                          onChange={(e) => {
                            setManualCameraTypeValue(e.target.value);
                            setDynamicAttrs(prev => ({ ...prev, type: e.target.value }));
                          }}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Sensor Size Button Selector */}
                    {isDigitalCameraCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Sensor Size</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['APS-C', 'Full Frame', 'Others'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, sensor_size: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.sensor_size === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CCTV Type Button Selector */}
                    {isCctvCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Type *</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Analog CCTV Cameras', 'IP Security Cameras', 'Wireless CCTV Cameras'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, type: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.type === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wifi Button Selector */}
                    {isCctvCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Wifi</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Yes', 'No'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, wifi: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.wifi === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Camera Accessories Type selection */}
                    {isCameraAccCategory && (
                      <div className="space-y-2">
                        <SearchableSelect
                          label="Type *"
                          options={STATIC_CAMERA_ACC_TYPES.map(t => ({ value: t.id, label: t.name }))}
                          value={selectedCameraAccTypeId}
                          onChange={(typeId) => {
                            setSelectedCameraAccTypeId(typeId);
                            if (typeId === 'manual-add-type') {
                              setIsManualCameraAccType(true);
                              setManualCameraAccTypeValue('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            } else {
                              setIsManualCameraAccType(false);
                              const typeName = STATIC_CAMERA_ACC_TYPES.find(t => t.id === typeId)?.name || '';
                              setDynamicAttrs(prev => ({ ...prev, type: typeName }));
                            }
                          }}
                          placeholder="Select type..."
                        />
                      </div>
                    )}

                    {/* Camera Accessories Type Manual Entry */}
                    {isCameraAccCategory && isManualCameraAccType && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Enter Type Manually *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualCameraAccType(false);
                              setManualCameraAccTypeValue('');
                              setSelectedCameraAccTypeId('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                        <Input
                          placeholder="e.g. Filter, Lens Cap etc."
                          value={manualCameraAccTypeValue}
                          onChange={(e) => {
                            setManualCameraAccTypeValue(e.target.value);
                            setDynamicAttrs(prev => ({ ...prev, type: e.target.value }));
                          }}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Chargers Device Type selection */}
                    {isChargerCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Device Type *</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Tablet', 'Mobile', 'Smart Watch'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, device_type: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.device_type === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chargers Type selection */}
                    {isChargerCategory && (
                      <div className="space-y-2">
                        <SearchableSelect
                          label="Type *"
                          options={STATIC_CHARGER_TYPES.map(t => ({ value: t.id, label: t.name }))}
                          value={selectedChargerTypeId}
                          onChange={(typeId) => {
                            setSelectedChargerTypeId(typeId);
                            if (typeId === 'manual-add-type') {
                              setIsManualChargerType(true);
                              setManualChargerTypeValue('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            } else {
                              setIsManualChargerType(false);
                              const typeName = STATIC_CHARGER_TYPES.find(t => t.id === typeId)?.name || '';
                              setDynamicAttrs(prev => ({ ...prev, type: typeName }));
                            }
                          }}
                          placeholder="Select type..."
                        />
                      </div>
                    )}

                    {/* Chargers Type Manual Entry */}
                    {isChargerCategory && isManualChargerType && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Enter Type Manually *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualChargerType(false);
                              setManualChargerTypeValue('');
                              setSelectedChargerTypeId('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                        <Input
                          placeholder="e.g. Multiport, GaN Charger etc."
                          value={manualChargerTypeValue}
                          onChange={(e) => {
                            setManualChargerTypeValue(e.target.value);
                            setDynamicAttrs(prev => ({ ...prev, type: e.target.value }));
                          }}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Cables Type selection */}
                    {isCableCategory && (
                      <div className="space-y-2">
                        <SearchableSelect
                          label="Type *"
                          options={STATIC_CABLE_TYPES.map(t => ({ value: t.id, label: t.name }))}
                          value={selectedCableTypeId}
                          onChange={(typeId) => {
                            setSelectedCableTypeId(typeId);
                            if (typeId === 'manual-add-type') {
                              setIsManualCableType(true);
                              setManualCableTypeValue('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            } else {
                              setIsManualCableType(false);
                              const typeName = STATIC_CABLE_TYPES.find(t => t.id === typeId)?.name || '';
                              setDynamicAttrs(prev => ({ ...prev, type: typeName }));
                            }
                          }}
                          placeholder="Select type..."
                        />
                      </div>
                    )}

                    {/* Cables Type Manual Entry */}
                    {isCableCategory && isManualCableType && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Enter Type Manually *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualCableType(false);
                              setManualCableTypeValue('');
                              setSelectedCableTypeId('');
                              setDynamicAttrs(prev => ({ ...prev, type: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                        <Input
                          placeholder="e.g. HDMI, Aux, Lightning to USB-C etc."
                          value={manualCableTypeValue}
                          onChange={(e) => {
                            setManualCableTypeValue(e.target.value);
                            setDynamicAttrs(prev => ({ ...prev, type: e.target.value }));
                          }}
                          autoFocus
                        />
                      </div>
                    )}

                    {/* Covers & Cases Type selection */}
                    {isCaseCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Type *</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Tablet', 'Mobile', 'Smart Watch'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, type: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.type === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screen Protectors Type selection */}
                    {isProtectorCategory && (
                      <div className="col-span-full space-y-2">
                        <label className="label text-sm font-semibold">Type *</label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Tablet', 'Mobile', 'Smart Watch'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setDynamicAttrs(prev => ({ ...prev, type: opt }));
                              }}
                              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${dynamicAttrs.type === opt
                                ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-surface text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isChargerCategory && !isCableCategory && !isCaseCategory && !isProtectorCategory && (
                      <div className="space-y-2">
                        <SearchableSelect
                          label={isMakeInsteadOfBrand ? "Make *" : "Brand *"}
                          options={brands.map(b => ({ value: b.id, label: b.name, logoUrl: b.logoUrl }))}
                          value={selectedBrandId}
                          onChange={(brandId) => {
                            setSelectedBrandId(brandId);
                            if (brandId === 'manual-add-brand') {
                              setIsManualBrand(true);
                              setManualBrandValue('');
                              setDynamicAttrs(prev => ({ ...prev, brand: '', model: '' }));
                            } else {
                              setIsManualBrand(false);
                              const brandName = brands.find(b => b.id === brandId)?.name || '';
                              setDynamicAttrs(prev => ({ ...prev, brand: brandName, model: '' }));
                            }
                            setIsManualModel(false);
                            setManualModelValue('');
                          }}
                          placeholder={brandsLoading ? "Loading brands..." : (isMakeInsteadOfBrand ? "Search and select make..." : "Search and select brand...")}
                          disabled={brandsLoading}
                        />
                      </div>
                    )}

                    {!isChargerCategory && !isCableCategory && !isCaseCategory && !isProtectorCategory && isManualBrand && (
                      <div className="col-span-full space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">{isMakeInsteadOfBrand ? "Enter Make Manually *" : "Enter Brand Name Manually *"}</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualBrand(false);
                              setManualBrandValue('');
                              setSelectedBrandId('');
                              setDynamicAttrs(prev => ({ ...prev, brand: '' }));
                            }}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                        <Input
                          placeholder={isMakeInsteadOfBrand ? "e.g. Toyota, Honda, Suzuki etc." : "e.g. Acer, Apple, HP, ASUS etc."}
                          value={manualBrandValue}
                          onChange={(e) => {
                            setManualBrandValue(e.target.value);
                            setDynamicAttrs(prev => ({ ...prev, brand: e.target.value }));
                          }}
                          autoFocus
                        />
                      </div>
                    )}

                    {selectedBrandId && !isTabletCategory && !isLaptopCategory && !isMonitorCategory && !isCameraCategory && !isAtvCategory && !isBicycleCategory && (
                      <div className="space-y-2">
                        <label className="label text-sm font-semibold">Model *</label>
                        {isManualModel ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter custom model name..."
                              value={manualModelValue}
                              onChange={(e) => handleManualModelChange(e.target.value)}
                              className="flex-1"
                              autoFocus
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setIsManualModel(false);
                                setManualModelValue('');
                                setDynamicAttrs(prev => ({ ...prev, model: '' }));
                              }}
                              className="shrink-0"
                            >
                              <X size={14} /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.model || ''}
                            onChange={(e) => handleModelSelect(e.target.value)}
                          >
                            <option value="">Search and select model...</option>
                            {models.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                        )}
                        {!isManualModel && dynamicAttrs.model && (
                          <p className="text-xs text-slate-400 mt-1">
                            Selected: <strong>{dynamicAttrs.model}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Car Specifications Dynamic Form Fields */}
              {isCarCategoryOrInstallments && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {isCarsOnInstallments ? "Cars on Installments Specifications" : "Car Specifications"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Fill in specific attributes to help buyers find your car faster.</p>
                  </div>

                  {/* Cars on Installments Extra Fields */}
                  {isCarsOnInstallments && (
                    <>
                      {/* Monthly installment* */}
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Monthly installment *</label>
                        <input
                          type="number"
                          className="input text-sm"
                          placeholder="Enter monthly installment"
                          value={dynamicAttrs.monthly_installment || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, monthly_installment: e.target.value }))}
                        />
                      </div>

                      {/* Installment plan* */}
                      <div className="space-y-1">
                        <SearchableSelect
                          label="Installment plan *"
                          options={[
                            { value: 'Flexible', label: 'Flexible' },
                            { value: '1 Year', label: '1 Year' },
                            { value: '2 Years', label: '2 Years' },
                            { value: '3 Years', label: '3 Years' },
                            { value: '4 Years', label: '4 Years' },
                            { value: '5 Years', label: '5 Years' },
                            { value: '6 Years', label: '6 Years' },
                            { value: '7 Years', label: '7 Years' }
                          ]}
                          value={dynamicAttrs.installment_plan || ''}
                          onChange={(val) => setDynamicAttrs(prev => ({ ...prev, installment_plan: val }))}
                          placeholder="Select installment plan"
                        />
                      </div>
                    </>
                  )}

                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2023"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* Fuel* */}
                  <div className="space-y-1">
                    <SearchableSelect
                      label="Fuel *"
                      options={CAR_FUELS.map(f => ({ value: f, label: f }))}
                      value={dynamicAttrs.fuel || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, fuel: val }))}
                      placeholder="Search and select fuel type..."
                    />
                  </div>

                  {/* Transmission* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Transmission *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Automatic', 'Manual'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, transmission: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.transmission === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Type* */}
                  <div className="space-y-1">
                    <SearchableSelect
                      label="Body Type *"
                      options={CAR_BODY_TYPES.map(b => ({ value: b, label: b }))}
                      value={dynamicAttrs.body_type || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, body_type: val }))}
                      placeholder="Search and select body type..."
                    />
                  </div>

                  {/* Color* */}
                  <div className="space-y-1">
                    <SearchableSelect
                      label="Color *"
                      options={CAR_COLORS.map(c => ({ value: c, label: c }))}
                      value={dynamicAttrs.color || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, color: val }))}
                      placeholder="Search and select color..."
                    />
                  </div>

                  {/* Number of seats */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Number of seats</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 5"
                      value={dynamicAttrs.seats || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, seats: e.target.value }))}
                    />
                  </div>

                  {/* Number of Owners */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Number of Owners</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter number of owners"
                      value={dynamicAttrs.owners || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, owners: e.target.value }))}
                    />
                  </div>

                  {/* Registration city */}
                  <div className="space-y-1">
                    <SearchableSelect
                      label="Registration city"
                      options={REGISTRATION_CITIES.map(rc => ({ value: rc, label: rc }))}
                      value={dynamicAttrs.registration_city || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, registration_city: val }))}
                      placeholder="Search registration city..."
                    />
                  </div>

                  {/* Car documents* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Car documents *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Original', 'Duplicate'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, documents: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.documents === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assembly* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Assembly *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Local', 'Imported'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, assembly: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.assembly === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['ABS', 'Airbags', 'Premium Wheels/Rims', 'AM/FM Radio'].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <label key={feature} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-surface cursor-pointer select-none transition-all duration-200 hover:border-slate-300">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newFeatures = isSelected
                                  ? selectedFeatures.filter(f => f !== feature)
                                  : [...selectedFeatures, feature];
                                setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{feature}</span>
                          </label>
                        );
                      })}
                      {showMoreFeatures && ['Air Conditioning', 'Alloy Rims', 'Navigation System', 'Power Steering', 'Power Windows', 'Power Mirrors', 'Sunroof', 'Cruise Control', 'Keyless Entry', 'Push Start', 'Back Camera'].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <label key={feature} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-surface cursor-pointer select-none transition-all duration-200 hover:border-slate-300">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const newFeatures = isSelected
                                  ? selectedFeatures.filter(f => f !== feature)
                                  : [...selectedFeatures, feature];
                                setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                              }}
                              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{feature}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMoreFeatures(!showMoreFeatures)}
                        className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 focus:outline-none w-fit"
                      >
                        <span>{showMoreFeatures ? 'Show less' : 'Select more'}</span>
                        <span className="text-sm font-bold">{showMoreFeatures ? '-' : '+'}</span>
                      </button>
                      {dynamicAttrs.features && (
                        <span className="text-xs text-slate-500 self-start sm:self-auto">
                          Selected: <strong className="text-slate-700 dark:text-slate-300">{dynamicAttrs.features}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Trucks & Buses Dynamic Form Fields */}
              {isTruckCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2021"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* Fuel* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Fuel *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.fuel || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, fuel: e.target.value }))}
                    >
                      <option value="">Select Fuel</option>
                      {['Diesel', 'Petrol', 'CNG', 'Hybrid', 'Electric'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Transmission* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Transmission *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Automatic', 'Manual'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, transmission: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.transmission === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registration city */}
                  <div className="col-span-full space-y-1">
                    <SearchableSelect
                      label="Registration city"
                      options={REGISTRATION_CITIES.map(rc => ({ value: rc, label: rc }))}
                      value={dynamicAttrs.registration_city || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, registration_city: val }))}
                      placeholder="Search registration city..."
                    />
                  </div>

                  {/* KM's driven* */}
                  <div className="col-span-full space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">KM's driven *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter km's driven"
                      value={dynamicAttrs.km_driven || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, km_driven: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Heavy Machinery Dynamic Form Fields */}
              {isHeavyMachineryCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Type* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Select Type</option>
                      {['Excavator', 'Bulldozer', 'Crane', 'Forklift', 'Roller', 'Loader', 'Generator', 'Other'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2018"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Rickshaw & Chingchi Dynamic Form Fields */}
              {isRickshawCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2022"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* Fuel */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Fuel</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.fuel || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, fuel: e.target.value }))}
                    >
                      <option value="">Select Fuel</option>
                      {['CNG', 'Petrol', 'LPG', 'Electric', 'Hybrid'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Registration city */}
                  <div className="col-span-full space-y-1">
                    <SearchableSelect
                      label="Registration city"
                      options={REGISTRATION_CITIES.map(rc => ({ value: rc, label: rc }))}
                      value={dynamicAttrs.registration_city || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, registration_city: val }))}
                      placeholder="Search registration city..."
                    />
                  </div>

                  {/* KM's driven* */}
                  <div className="col-span-full space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">KM's driven *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter km's driven"
                      value={dynamicAttrs.km_driven || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, km_driven: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Tractors & Trailers Dynamic Form Fields */}
              {isTractorCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2020"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* KM's driven* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">KM's driven *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter km's driven"
                      value={dynamicAttrs.km_driven || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, km_driven: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Boats Dynamic Form Fields */}
              {isBoatsCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Type* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Select Type</option>
                      {['Speedboat', 'Yacht', 'Jet Ski', 'Fishing Boat', 'Cabin Cruiser', 'Inflatable', 'Other'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2019"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Motorcycles & Scooters Dynamic Form Fields */}
              {(isMotorcycleCategory || isScooterCategory) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2021"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* Fuel* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Fuel *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.fuel || (isElectricBikeCategory ? 'Electric' : '')}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, fuel: e.target.value }))}
                    >
                      <option value="">Select Fuel</option>
                      {['Petrol', 'Electric', 'CNG', 'Hybrid'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Engine Type */}
                  {!isElectricBikeCategory && (
                    <div className="col-span-full space-y-2">
                      <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Engine Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['2 Stroke', '4 Stroke'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDynamicAttrs(prev => ({ ...prev, engine_type: opt }))}
                            className={cn(
                              "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                              dynamicAttrs.engine_type === opt
                                ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                                : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                            )}
                          >
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engine Capacity */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Engine Capacity</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.engine_capacity || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, engine_capacity: e.target.value }))}
                    >
                      <option value="">Select engine capacity</option>
                      {[
                        '< 50cc',
                        '70cc',
                        '100cc - 149cc',
                        '150cc - 199cc',
                        '200cc - 249cc',
                        '250cc - 299cc',
                        '300cc - 499cc',
                        '500cc - 699cc',
                        '700cc - 999cc',
                        '1000cc',
                        'Above 1000cc'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* KM's driven */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">KM's driven *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter km's driven"
                      value={dynamicAttrs.km_driven || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, km_driven: e.target.value }))}
                    />
                  </div>

                  {/* Ignition type */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Ignition type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Self Start', 'Kickstarter'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, ignition_type: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.ignition_type === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Origin */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Origin</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Local', 'Chinese', 'Imported'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, origin: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.origin === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registration city */}
                  <div className="col-span-full space-y-1">
                    <SearchableSelect
                      label="Registration city *"
                      options={REGISTRATION_CITIES.map(rc => ({ value: rc, label: rc }))}
                      value={dynamicAttrs.registration_city || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, registration_city: val }))}
                      placeholder="Select registration city"
                    />
                  </div>
                </div>
              )}

              {/* ATV & Quads Dynamic Form Fields */}
              {isAtvCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Year* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="e.g. 2022"
                      value={dynamicAttrs.year || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, year: e.target.value }))}
                    />
                  </div>

                  {/* KM's driven */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">KM's driven</label>
                    <input
                      type="number"
                      className="input text-sm"
                      placeholder="Enter km's driven"
                      value={dynamicAttrs.km_driven || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, km_driven: e.target.value }))}
                    />
                  </div>

                  {/* Engine Type */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-sm font-semibold text-slate-700 dark:text-slate-300">Engine Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['2 Stroke', '4 Stroke'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, engine_type: opt }))}
                          className={cn(
                            "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                            dynamicAttrs.engine_type === opt
                              ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                              : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                          )}
                        >
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engine Capacity */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300 font-semibold">Engine Capacity</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.engine_capacity || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, engine_capacity: e.target.value }))}
                    >
                      <option value="">Select Engine Capacity</option>
                      {[
                        '< 50cc',
                        '70cc',
                        '100cc - 149cc',
                        '150cc - 199cc',
                        '200cc - 249cc',
                        '250cc - 299cc',
                        '300cc - 499cc',
                        '500cc - 699cc',
                        '700cc - 999cc',
                        '1000cc',
                        'Above 1000cc'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Registration city */}
                  <div className="col-span-full space-y-1">
                    <SearchableSelect
                      label="Registration city"
                      options={REGISTRATION_CITIES.map(rc => ({ value: rc, label: rc }))}
                      value={dynamicAttrs.registration_city || ''}
                      onChange={(val) => setDynamicAttrs(prev => ({ ...prev, registration_city: val }))}
                      placeholder="Search registration city..."
                    />
                  </div>
                </div>
              )}

              {/* Bicycles Dynamic Form Fields */}
              {isBicycleCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Bicycle Type* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Select Bicycle Type</option>
                      {['Mountain Bike', 'Road Bike', 'Hybrid Bike', 'BMX Bike', 'Folding Bike', 'Kids Bike', 'Other'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Frame Size */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Frame Size</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="e.g. Medium, 18 inches"
                      value={dynamicAttrs.frame_size || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, frame_size: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Bike Care Dynamic Form Fields */}
              {isBikeCareCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {/* Care Product Type* */}
                  <div className="space-y-1 col-span-full sm:col-span-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Select Care Product Type</option>
                      {['Cleaners', 'Microfiber Cloths', 'Pads, Sponges & Brushes', 'Polishes', 'Waxes', 'Other'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Land & Plots Dynamic Form Fields */}
              {isLandPlotsCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Plot Details</h3>
                    <p className="text-xs text-slate-400">Specify details about your land or plot.</p>
                  </div>

                  {/* Type* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="">Select type</option>
                      {[
                        'Agricultural Land',
                        'Commercial Plots',
                        'Files',
                        'Industrial Land',
                        'Residential Plots',
                        'Plot Form'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area unit* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area unit *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.area_unit || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area_unit: e.target.value }))}
                      required
                    >
                      <option value="">Select area unit</option>
                      {[
                        'Kanal',
                        'Marla',
                        'Square Feet',
                        'Square Meter',
                        'Square Yards'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Enter area"
                      value={dynamicAttrs.area || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Corner Plot',
                        'Park Facing',
                        'Disputed',
                        'Sewerage',
                        'Electricity',
                        'Water Supply',
                        'Gas Supply',
                        'Boundry Wall'
                      ].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              const newFeatures = isSelected
                                ? selectedFeatures.filter(f => f !== feature)
                                : [...selectedFeatures, feature];
                              setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Houses Dynamic Form Fields */}
              {isHousesCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">House Details</h3>
                    <p className="text-xs text-slate-400">Specify details about your house or property.</p>
                  </div>

                  {/* Furnished* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Furnished *</label>
                    <div className="flex gap-3">
                      {['Unfurnished', 'Furnished'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, furnished: opt }))}
                          className={`px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            dynamicAttrs.furnished === opt
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bedrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bedrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bedrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bedrooms</option>
                      {['1', '2', '3', '4', '5', '6+', 'Studio'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bathrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bathrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bathrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bathrooms</option>
                      {['1', '2', '3', '4', '5', '6', '7+'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Construction State* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Construction State *</label>
                    <div className="flex gap-3">
                      {['Grey Structure', 'Finished'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, construction_state: opt }))}
                          className={`px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            dynamicAttrs.construction_state === opt
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area unit* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area unit *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.area_unit || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area_unit: e.target.value }))}
                      required
                    >
                      <option value="">Select area unit</option>
                      {[
                        'Kanal',
                        'Marla',
                        'Square Feet',
                        'Square Meter',
                        'Square Yards'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Enter area"
                      value={dynamicAttrs.area || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Servant Quarters',
                        'Drawing Room',
                        'Dining Room',
                        'Kitchen',
                        'Study Room',
                        'Prayer Room',
                        'Powder Room',
                        'Gym',
                        'Store Room',
                        'Steam Room',
                        'Lounge or Sitting Room',
                        'Laundry Room'
                      ].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              const newFeatures = isSelected
                                ? selectedFeatures.filter(f => f !== feature)
                                : [...selectedFeatures, feature];
                              setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Apartments & Flats Dynamic Form Fields */}
              {isApartmentsCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Apartment Details</h3>
                    <p className="text-xs text-slate-400">Specify details about your apartment or flat.</p>
                  </div>

                  {/* Furnished* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Furnished *</label>
                    <div className="flex gap-3">
                      {['Unfurnished', 'Furnished'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, furnished: opt }))}
                          className={`px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            dynamicAttrs.furnished === opt
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bedrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bedrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bedrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bedrooms</option>
                      {['1', '2', '3', '4', '5', '6+', 'Studio'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bathrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bathrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bathrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bathrooms</option>
                      {['1', '2', '3', '4', '5', '6', '7+'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Level* */}
                  <div className="col-span-full space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Floor Level *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.floor_level || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, floor_level: e.target.value }))}
                      required
                    >
                      <option value="">Select floor level</option>
                      {['Ground', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+', 'Basement'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area unit* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area unit *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.area_unit || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area_unit: e.target.value }))}
                      required
                    >
                      <option value="">Select area unit</option>
                      {[
                        'Kanal',
                        'Marla',
                        'Square Feet',
                        'Square Meter',
                        'Square Yards'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Enter area"
                      value={dynamicAttrs.area || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Servant Quarters',
                        'Drawing Room',
                        'Dining Room',
                        'Kitchen',
                        'Study Room',
                        'Prayer Room',
                        'Powder Room',
                        'Gym',
                        'Store Room',
                        'Steam Room',
                        'Lounge or Sitting Room',
                        'Laundry Room'
                      ].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              const newFeatures = isSelected
                                ? selectedFeatures.filter(f => f !== feature)
                                : [...selectedFeatures, feature];
                              setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Shops - Offices - Commercial Space Dynamic Form Fields */}
              {isCommercialCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Commercial Details</h3>
                    <p className="text-xs text-slate-400">Specify details about your commercial property.</p>
                  </div>

                  {/* Type* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.type || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="">Select type</option>
                      {['Office', 'Shop', 'Warehouse', 'Factory', 'Building'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Level* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Floor level *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.floor_level || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, floor_level: e.target.value }))}
                      required
                    >
                      <option value="">Select floor level</option>
                      {['0', '1', '2', '3', '4', '5', '6', '7+'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area unit* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area unit *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.area_unit || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area_unit: e.target.value }))}
                      required
                    >
                      <option value="">Select area unit</option>
                      {[
                        'Kanal',
                        'Marla',
                        'Square Feet',
                        'Square Meter',
                        'Square Yards'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Enter area"
                      value={dynamicAttrs.area || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Parking Spaces Available',
                        'Lobby in Building',
                        'Double Glazed Windows',
                        'Central Air Conditioning',
                        'Central Heating',
                        'Electricity Backup',
                        'Waste Disposal',
                        'Elevators'
                      ].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              const newFeatures = isSelected
                                ? selectedFeatures.filter(f => f !== feature)
                                : [...selectedFeatures, feature];
                              setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Portions & Floors Dynamic Form Fields */}
              {isPortionsCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="col-span-full mb-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Portion Details</h3>
                    <p className="text-xs text-slate-400">Specify details about your portion or floor.</p>
                  </div>

                  {/* Furnished* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Furnished *</label>
                    <div className="flex gap-3">
                      {['Unfurnished', 'Furnished'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDynamicAttrs(prev => ({ ...prev, furnished: opt }))}
                          className={`px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            dynamicAttrs.furnished === opt
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bedrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bedrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bedrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bedrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bedrooms</option>
                      {['1', '2', '3', '4', '5', '6+', 'Studio'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Bathrooms *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.bathrooms || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, bathrooms: e.target.value }))}
                      required
                    >
                      <option value="">Select bathrooms</option>
                      {['1', '2', '3', '4', '5', '6', '7+'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor Level* */}
                  <div className="col-span-full space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Floor Level *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.floor_level || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, floor_level: e.target.value }))}
                      required
                    >
                      <option value="">Select floor level</option>
                      {['Ground', '1', '2', '3', '4', '5', '6', '7+', 'Basement'].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area unit* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area unit *</label>
                    <select
                      className="input text-sm cursor-pointer"
                      value={dynamicAttrs.area_unit || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area_unit: e.target.value }))}
                      required
                    >
                      <option value="">Select area unit</option>
                      {[
                        'Kanal',
                        'Marla',
                        'Square Feet',
                        'Square Meter',
                        'Square Yards'
                      ].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area* */}
                  <div className="space-y-1">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Area *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Enter area"
                      value={dynamicAttrs.area || ''}
                      onChange={(e) => setDynamicAttrs(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Features* */}
                  <div className="col-span-full space-y-2">
                    <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Features *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Servant Quarters',
                        'Drawing Room',
                        'Dining Room',
                        'Kitchen',
                        'Study Room',
                        'Prayer Room',
                        'Powder Room',
                        'Gym',
                        'Store Room',
                        'Steam Room',
                        'Lounge or Sitting Room',
                        'Laundry Room'
                      ].map(feature => {
                        const selectedFeatures = dynamicAttrs.features ? dynamicAttrs.features.split(',').map(f => f.trim()) : [];
                        const isSelected = selectedFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => {
                              const newFeatures = isSelected
                                ? selectedFeatures.filter(f => f !== feature)
                                : [...selectedFeatures, feature];
                              setDynamicAttrs(prev => ({ ...prev, features: newFeatures.join(', ') }));
                            }}
                            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-500'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {feature}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Category-Specific Dynamic Form Fields */}
              {!isAnimalsCategory && !isServicesCategory && !isBusinessCategory && activeAttributesSchema.filter((attr: any) => {
                if (isChargerCategory || isCableCategory || isCaseCategory || isProtectorCategory || isAnimalsCategory) return false;
                if (attr.name === 'brand' && brands.length > 0) return false;
                if (attr.name === 'model' || attr.name === 'type' || attr.name === 'part_type' || attr.name === 'sensor_size' || attr.name === 'wifi') return false;
                return true;
              }).length > 0 && (() => {
                const filteredAttrs = activeAttributesSchema.filter((attr: any) => {
                  if (isChargerCategory || isCableCategory || isCaseCategory || isProtectorCategory || isAnimalsCategory) return false;
                  if (attr.name === 'brand' && brands.length > 0) return false;
                  if (attr.name === 'model' || attr.name === 'type' || attr.name === 'part_type' || attr.name === 'sensor_size' || attr.name === 'wifi') return false;
                  return true;
                });
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="col-span-full mb-1">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Category Attributes</h3>
                      <p className="text-xs text-slate-400">Fill in specific attributes to help buyers find your listing faster.</p>
                    </div>
                    {filteredAttrs.map((attr: any) => {
                      const value = dynamicAttrs[attr.name] || '';
                      const errorMsg = attr.required && !value ? `${attr.label} is required` : undefined;

                      if (attr.name === 'pta_status') {
                        const ptaOptions = ["PTA Approved", "Non PTA", "Factory Unlocked", "JV Device", "Not Applicable"];
                        return (
                          <div key={attr.name} className="col-span-full space-y-2">
                            <label className="label text-sm font-semibold">{attr.label} *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {ptaOptions.map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setDynamicAttrs(prev => ({ ...prev, pta_status: opt }))}
                                  className={cn(
                                    "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                                    dynamicAttrs.pta_status === opt
                                      ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                                      : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                                  )}
                                >
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt}</span>
                                </button>
                              ))}
                            </div>
                            {errorMsg && <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>}
                          </div>
                        );
                      }

                      return (
                        <div key={attr.name} className="space-y-1">
                          <label className="label text-xs font-semibold">
                            {attr.label} {attr.required && '*'}
                          </label>
                          {attr.type === 'select' ? (
                            <select
                              className="input text-sm cursor-pointer"
                              value={value}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, [attr.name]: e.target.value }))}
                            >
                              <option value="">Select {attr.label}</option>
                              {attr.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={attr.type === 'number' ? 'number' : 'text'}
                              className="input text-sm"
                              placeholder={`Enter ${attr.label}`}
                              value={value}
                              onChange={(e) => setDynamicAttrs(prev => ({ ...prev, [attr.name]: e.target.value }))}
                            />
                          )}
                          {errorMsg && <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Electronics & Home Appliances Dynamic Form Fields */}
              {isElectronicsCategory && (() => {
                const subName = (subCat?.name || '').toLowerCase();
                const subSubName = (subSubCat?.name || '').toLowerCase();
                const subId = subCat?.id || '';
                const subSubId = subSubCat?.id || '';

                const isTvSection = subId === 'd1000000-0000-0000-0000-000000000202' || subName.includes('television') || subSubName.includes('television') || subSubName.includes('tv');
                const isAcSection = subId === 'd1000000-0000-0000-0000-000000000205' || subSubId === 'd1000000-0000-0000-0000-000000000601' || subName.includes('ac & cooler') || subSubName.includes('air conditioner');
                const isCoolerSection = subSubId === 'd1000000-0000-0000-0000-000000000602' || subSubName.includes('air cooler');
                const isFridgeSection = subId === 'd1000000-0000-0000-0000-000000000204' || subSubId === 'd1000000-0000-0000-0000-000000000501' || subName.includes('refrigerator');
                const isFreezerSection = subSubId === 'd1000000-0000-0000-0000-000000000502' || subSubName.includes('freezer');
                const isWashingSection = subId === 'd1000000-0000-0000-0000-000000000207' || subSubId.startsWith('d1000000-0000-0000-0000-00000000080') || subName.includes('washing') || subSubName.includes('washer');
                const isOvenMicrowaveSection = subId === 'd1000000-0000-0000-0000-000000000210' || subSubId === 'd1000000-0000-0000-0000-000000000813' || subSubId === 'd1000000-0000-0000-0000-000000000814' || subName.includes('microwave');
                const isGeneratorSection = subSubId === 'd1000000-0000-0000-0000-000000000807' || subSubName.includes('generator');
                const isUpsSection = subSubId === 'd1000000-0000-0000-0000-000000000808' || subSubName.includes('ups');
                const isSolarPanelSection = subSubId === 'd1000000-0000-0000-0000-000000000809' || subSubName.includes('solar panel');
                const isSolarInverterSection = subSubId === 'd1000000-0000-0000-0000-000000000810' || subSubName.includes('solar inverter');
                const isBatterySection = subSubId === 'd1000000-0000-0000-0000-000000000812' || subSubName.includes('battery');
                const isKitchenSection = subId === 'd1000000-0000-0000-0000-000000000211' || subSubId.startsWith('d1000000-0000-0000-0000-0000000009') || subName.includes('kitchen');
                const isGamingSection = subId === 'd1000000-0000-0000-0000-000000000206' || subId === 'c1000000-0000-0000-0000-000000000117' || subName.includes('gaming console') || (subName.includes('games') && !subName.includes('computer') && !subName.includes('accessories'));
                const isFanSection = subId === 'd1000000-0000-0000-0000-000000000212' || subSubId.startsWith('d1000000-0000-0000-0000-000000000a0') || subName.includes('fans');
                const isHeaterGeyserSection = subId === 'd1000000-0000-0000-0000-000000000213' || subName.includes('heaters') || subSubName.includes('geyser') || subSubName.includes('heater');
                const isToolsSection = subId === 'd1000000-0000-0000-0000-000000000217' || subSubId.startsWith('d1000000-0000-0000-0000-000000000a1') || subName.includes('tools');
                const isWaterDispenserSection = subId === 'd1000000-0000-0000-0000-000000000216' || subName.includes('dispenser');

                const isServerSection = subSubId === 'd1000000-0000-0000-0000-000000000701' || subSubId === 'c1000000-0000-0000-0000-000000000701' || subSubName.includes('server');
                const isSoftwareSection = subSubId === 'd1000000-0000-0000-0000-000000000702' || subSubId === 'c1000000-0000-0000-0000-000000000702' || subSubName.includes('software');
                const isGamingPcSection = subSubId === 'd1000000-0000-0000-0000-000000000703' || subSubId === 'c1000000-0000-0000-0000-000000000703' || subSubName.includes('gaming pc');
                const isNetworkingSection = subSubId === 'd1000000-0000-0000-0000-000000000704' || subSubId === 'c1000000-0000-0000-0000-000000000704' || subSubName.includes('network');
                const isPrinterSection = subSubId === 'd1000000-0000-0000-0000-000000000705' || subSubId === 'c1000000-0000-0000-0000-000000000705' || subSubName.includes('printer') || subSubName.includes('photocopier');
                const isInkTonerSection = subSubId === 'd1000000-0000-0000-0000-000000000706' || subSubId === 'c1000000-0000-0000-0000-000000000706' || subSubName.includes('ink') || subSubName.includes('toner');
                const is3dPrinterSection = subSubId === 'd1000000-0000-0000-0000-000000000707' || subSubId === 'c1000000-0000-0000-0000-000000000707' || subSubName.includes('3d printer');

                let brandOptions: string[] = [];
                if (isTvSection) brandOptions = ['Samsung', 'LG', 'TCL', 'Sony', 'Haier', 'Orient', 'EcoStar', 'Changhong Ruba', 'Hisense', 'Panasonic', 'Sharp', 'Toshiba', 'Other'];
                else if (isAcSection || isCoolerSection) brandOptions = ['Gree', 'Haier', 'Dawlance', 'Orient', 'Kenwood', 'PEL', 'TCL', 'Samsung', 'LG', 'Panasonic', 'Super Asia', 'Boss', 'Other'];
                else if (isFridgeSection || isFreezerSection) brandOptions = ['Dawlance', 'Haier', 'PEL', 'Orient', 'Waves', 'Samsung', 'LG', 'Panasonic', 'EcoStar', 'Singer', 'Other'];
                else if (isWashingSection) brandOptions = ['Dawlance', 'Haier', 'Super Asia', 'Waves', 'Samsung', 'LG', 'PEL', 'Orient', 'Boss', 'Royal', 'Other'];
                else if (isOvenMicrowaveSection) brandOptions = ['Dawlance', 'Haier', 'Anex', 'Westpoint', 'Panasonic', 'Kenwood', 'Homage', 'Samsung', 'LG', 'Other'];
                else if (isGeneratorSection || isUpsSection || isSolarPanelSection || isSolarInverterSection || isBatterySection) brandOptions = ['Honda', 'Yamaha', 'Loncin', 'Denyo', 'Homage', 'Inverex', 'SolarMax', 'Fronus', 'Phoenix', 'Osaka', 'AGS', 'Exide', 'Canadian Solar', 'Longi', 'Jinko', 'Other'];
                else if (isKitchenSection) brandOptions = ['Anex', 'Westpoint', 'Kenwood', 'Philips', 'Black & Decker', 'Silver Crest', 'Sencor', 'Panasonic', 'Dawlance', 'Haier', 'Other'];
                else if (isGamingSection) brandOptions = ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Valve', 'Razer', 'ASUS ROG', 'MSI', 'Logitech', 'Other'];
                else if (isFanSection) brandOptions = ['Royal', 'Pak', 'GFC', 'Khurshid', 'Asia', 'Millat', 'Lahore', 'Super Asia', 'Other'];
                else if (isHeaterGeyserSection) brandOptions = ['Canon', 'NasGas', 'Singer', 'Super Asia', 'Boss', 'Fischer', 'Rays', 'Other'];
                else if (isToolsSection) brandOptions = ['Bosch', 'DeWalt', 'Makita', 'Total', 'Ingco', 'Crown', 'Stanley', 'Milwaukee', 'Other'];
                else if (isWaterDispenserSection) brandOptions = ['Dawlance', 'Homage', 'Orient', 'EcoStar', 'Waves', 'PEL', 'Other'];
                else if (isServerSection) brandOptions = ['Dell PowerEdge', 'HP ProLiant', 'Lenovo ThinkSystem', 'Supermicro', 'Cisco', 'Huawei', 'Fujitsu', 'IBM', 'Custom / Other'];
                else if (isSoftwareSection) brandOptions = ['Microsoft', 'Adobe', 'Autodesk', 'Antivirus (Kaspersky/NOD32)', 'Corel', 'QuickBooks / Tally', 'Oracle', 'VMware', 'Other'];
                else if (isGamingPcSection) brandOptions = ['Custom PC', 'ASUS ROG', 'MSI', 'Alienware / Dell', 'HP Omen', 'Lenovo Legion', 'Acer Predator', 'Gigabyte AORUS', 'Other'];
                else if (isNetworkingSection) brandOptions = ['Cisco', 'TP-Link', 'Mikrotik', 'Ubiquiti / UniFi', 'D-Link', 'Huawei', 'Netgear', 'Tenda', 'Mercury', 'Zyxel', 'Other'];
                else if (isPrinterSection) brandOptions = ['HP', 'Canon', 'Epson', 'Ricoh', 'Brother', 'Kyocera', 'Xerox', 'Panasonic', 'Konica Minolta', 'Zebra', 'Other'];
                else if (isInkTonerSection) brandOptions = ['HP', 'Canon', 'Epson', 'Brother', 'Ricoh', 'Xerox', 'Kyocera', 'ProDot', 'Compatible / Generic', 'Other'];
                else if (is3dPrinterSection) brandOptions = ['Creality (Ender)', 'Anycubic', 'Elegoo', 'Bambu Lab', 'Prusa', 'Artillery', 'Sunlu', 'FlashForge', 'Other'];
                else brandOptions = ['Samsung', 'LG', 'Haier', 'Dawlance', 'Philips', 'Panasonic', 'Sony', 'Other'];

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="col-span-full mb-1">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Product Specifications for {subSubCat?.name || subCat?.name || mainCat?.name}
                      </h3>
                      <p className="text-xs text-slate-400">Select relevant details for your product listing.</p>
                    </div>

                    {/* Brand Selection */}
                    <div className="space-y-1">
                      <SearchableSelect
                        label="Brand"
                        options={brandOptions.map(b => ({ value: b, label: b }))}
                        value={dynamicAttrs.brand || ''}
                        onChange={(val) => setDynamicAttrs(prev => ({ ...prev, brand: val }))}
                        placeholder="Search & select brand..."
                      />
                    </div>

                    {/* TV Specific Fields */}
                    {isTvSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Display Type / Tech</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select TV Type</option>
                            {['Smart TV', 'Android TV', 'LED TV', 'OLED', 'QLED', '4K UHD', 'HD Ready', 'Standard'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Screen Size</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.screen_size || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, screen_size: e.target.value }))}
                          >
                            <option value="">Select Screen Size</option>
                            {['24"', '32"', '40"', '43"', '50"', '55"', '65"', '75"+'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* AC Specific Fields */}
                    {isAcSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">AC Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select AC Type</option>
                            {['Inverter AC', 'Split AC', 'Floor Standing AC', 'Window AC', 'Portable AC'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Tonnage / Capacity</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.tonnage || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, tonnage: e.target.value }))}
                          >
                            <option value="">Select Tonnage</option>
                            {['1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton+'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Air Cooler Specific Fields */}
                    {isCoolerSection && (
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Cooler Type</label>
                        <select
                          className="input text-sm cursor-pointer"
                          value={dynamicAttrs.type || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="">Select Cooler Type</option>
                          {['Room Cooler', 'Desert Cooler', 'Personal Cooler', 'Tower Cooler'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Refrigerator Specific Fields */}
                    {isFridgeSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Refrigerator Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Refrigerator Type</option>
                            {['Double Door', 'Single Door', 'Side by Side', 'French Door', 'Multi Door'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Capacity (Cft / Liters)</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 14 Cft or 350L"
                            value={dynamicAttrs.capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, capacity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Freezer Specific Fields */}
                    {isFreezerSection && (
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Freezer Type</label>
                        <select
                          className="input text-sm cursor-pointer"
                          value={dynamicAttrs.type || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="">Select Freezer Type</option>
                          {['Deep Freezer', 'Chest Freezer', 'Upright Freezer'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Washing Machine Specific Fields */}
                    {isWashingSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Machine Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Type</option>
                            {['Top Load', 'Front Load', 'Automatic', 'Semi-Automatic', 'Twin Tub', 'Spin Dryer'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Capacity (KG)</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.capacity_kg || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, capacity_kg: e.target.value }))}
                          >
                            <option value="">Select Capacity</option>
                            {['6 kg', '7 kg', '8 kg', '9 kg', '10 kg', '12 kg+'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Microwaves & Ovens Specific Fields */}
                    {isOvenMicrowaveSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Oven / Microwave Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Type</option>
                            {['Solo Microwave', 'Grill Microwave', 'Convection Oven', 'Baking Oven'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Capacity (Liters)</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 25 Liters"
                            value={dynamicAttrs.capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, capacity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Generator Specific Fields */}
                    {isGeneratorSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Fuel Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.fuel || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, fuel: e.target.value }))}
                          >
                            <option value="">Select Fuel</option>
                            {['Petrol', 'Gas', 'Diesel', 'Dual Fuel'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Output Power (KVA / KW)</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 3.5 KVA"
                            value={dynamicAttrs.power_capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, power_capacity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* UPS / Inverter Specific Fields */}
                    {(isUpsSection || isSolarInverterSection) && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Capacity / Wattage</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 1200W or 3.2 KW"
                            value={dynamicAttrs.power_capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, power_capacity: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Wave Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.wave_type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, wave_type: e.target.value }))}
                          >
                            <option value="">Select Wave Type</option>
                            {['Pure Sine Wave', 'Modified Sine Wave'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Solar Panel Specific Fields */}
                    {isSolarPanelSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Panel Tech</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Panel Type</option>
                            {['Monocrystalline', 'Polycrystalline', 'Bifacial'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Wattage (W)</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 550W"
                            value={dynamicAttrs.power_capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, power_capacity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Battery Specific Fields */}
                    {isBatterySection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Battery Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Battery Type</option>
                            {['Tubular', 'Dry Battery', 'Gel Battery', 'Lithium', 'Lead Acid'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Capacity (Ah)</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 200 Ah"
                            value={dynamicAttrs.capacity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, capacity: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Gaming Specific Fields */}
                    {isGamingSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Console / Platform</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.model || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, model: e.target.value }))}
                          >
                            <option value="">Select Model / Platform</option>
                            {['PS5', 'PS4', 'PS3', 'Xbox Series X', 'Xbox Series S', 'Xbox One', 'Nintendo Switch', 'Steam Deck', 'PC'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Storage / Capacity</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.storage || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, storage: e.target.value }))}
                          >
                            <option value="">Select Storage</option>
                            {['500 GB', '825 GB', '1 TB', '2 TB', 'Digital Code / Disc'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Servers Specific Fields */}
                    {isServerSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Server Form Factor / Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Server Type</option>
                            {['Rack Server (1U/2U/4U)', 'Tower Server', 'Blade Server', 'Mini Server / NAS'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Processor / CPU</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.cpu || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, cpu: e.target.value }))}
                          >
                            <option value="">Select Processor</option>
                            {['Intel Xeon Dual/Quad', 'Intel Xeon Scalable', 'AMD EPYC', 'Intel Core i7/i9', 'AMD Ryzen', 'Other CPU'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">RAM / Memory</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.ram || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, ram: e.target.value }))}
                          >
                            <option value="">Select RAM</option>
                            {['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB+'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Storage Details</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 4x 1TB NVMe SSD + 8TB SAS HDD"
                            value={dynamicAttrs.storage || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, storage: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Softwares Specific Fields */}
                    {isSoftwareSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Software Category</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Category</option>
                            {['Operating System', 'Antivirus & Security', 'Office & Productivity', 'Graphic & Video Editing', 'CAD & 3D Design', 'Accounting & POS', 'Development & Utilities', 'Other Software'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">License / Subscription Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.license_type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, license_type: e.target.value }))}
                          >
                            <option value="">Select License Type</option>
                            {['Lifetime / Perpetual License', 'Annual Subscription', 'Monthly Subscription', 'Single PC Key', 'Multi-User / Enterprise'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Platform</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.platform || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, platform: e.target.value }))}
                          >
                            <option value="">Select Platform</option>
                            {['Windows', 'macOS', 'Linux', 'Cross-Platform / Cloud'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Gaming PCs Specific Fields */}
                    {isGamingPcSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Processor / CPU</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.cpu || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, cpu: e.target.value }))}
                          >
                            <option value="">Select CPU</option>
                            {['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Intel Core i3', 'Other CPU'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Graphics Card (GPU)</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.gpu || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, gpu: e.target.value }))}
                          >
                            <option value="">Select GPU</option>
                            {['NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070', 'NVIDIA RTX 4060', 'NVIDIA RTX 3080', 'NVIDIA RTX 3070', 'NVIDIA RTX 3060', 'NVIDIA GTX 1660 / Super', 'AMD Radeon RX Series', 'Integrated Graphics', 'Other GPU'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">RAM / Memory</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.ram || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, ram: e.target.value }))}
                          >
                            <option value="">Select RAM</option>
                            {['8 GB', '16 GB', '32 GB', '64 GB+'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Storage</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.storage || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, storage: e.target.value }))}
                          >
                            <option value="">Select Storage</option>
                            {['256 GB SSD', '512 GB SSD', '1 TB NVMe SSD', '2 TB NVMe SSD', '1 TB HDD + SSD', '2 TB HDD + SSD', 'Other'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Networking Specific Fields */}
                    {isNetworkingSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Device Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Device Type</option>
                            {['Router', 'Managed Switch', 'Unmanaged Switch', 'Wi-Fi Access Point', 'GPON / ONU Modem', 'Network Card / Adapter', 'Fiber Optic Media Converter', 'Patch Panel & Cables', 'SFP Transceiver Module', 'Other'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Speed / Wi-Fi Standard</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.speed_standard || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, speed_standard: e.target.value }))}
                          >
                            <option value="">Select Speed / Standard</option>
                            {['Wi-Fi 6 / 6E (802.11ax)', 'Wi-Fi 5 (802.11ac)', 'Dual Band (1200+ Mbps)', 'Gigabit Ethernet (1000 Mbps)', '10G Ethernet', 'Fast Ethernet (100 Mbps)'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Number of Ports</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.ports || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, ports: e.target.value }))}
                          >
                            <option value="">Select Ports</option>
                            {['4 Ports', '8 Ports', '16 Ports', '24 Ports', '48 Ports', 'N/A'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Printers & Photocopiers Specific Fields */}
                    {isPrinterSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Printer / Copier Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Type</option>
                            {['Laser Printer', 'Inkjet / Ink Tank Printer', 'Heavy Duty Photocopier', 'All-in-One (Print / Scan / Copy)', 'Thermal Barcode / Label Printer', 'Dot Matrix Printer'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Print Output</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.print_output || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, print_output: e.target.value }))}
                          >
                            <option value="">Select Output</option>
                            {['Black & White (Monochrome)', 'Color'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Connectivity</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.connectivity || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, connectivity: e.target.value }))}
                          >
                            <option value="">Select Connectivity</option>
                            {['Wi-Fi + Ethernet + USB', 'Wi-Fi + USB', 'Ethernet (LAN) + USB', 'USB Only', 'Bluetooth Mobile'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Max Paper Size</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.paper_size || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, paper_size: e.target.value }))}
                          >
                            <option value="">Select Paper Size</option>
                            {['A4 & Letter', 'A3 & A4', 'Legal & A4', 'Receipt / Label Roll'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Inks & Toners Specific Fields */}
                    {isInkTonerSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Item Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Item Type</option>
                            {['Laser Toner Cartridge', 'Ink Refill Bottle', 'Inkjet Cartridge', 'Drum Unit', 'Waste Toner Box'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Ink / Toner Color</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.color || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, color: e.target.value }))}
                          >
                            <option value="">Select Color</option>
                            {['Black', 'Cyan', 'Magenta', 'Yellow', 'Full Set (CMYK)'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* 3D Printers & Accessories Specific Fields */}
                    {is3dPrinterSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Item Category</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Category</option>
                            {['FDM 3D Printer', 'Resin (SLA/DLP) 3D Printer', 'PLA Filament', 'ABS Filament', 'PETG Filament', 'Resin Liquid', 'Hotend & Nozzle Kit', 'Build Plate / Sheet', 'Extruder / Stepper Motor', 'Other Parts'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Build Volume / Spec</label>
                          <input
                            type="text"
                            className="input text-sm"
                            placeholder="e.g. 220 x 220 x 250 mm or 1.75mm PLA Black (1KG)"
                            value={dynamicAttrs.build_volume || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, build_volume: e.target.value }))}
                          />
                        </div>
                      </>
                    )}

                    {/* Fan Specific Fields */}
                    {isFanSection && (
                      <>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Fan Type</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Fan Type</option>
                            {['Ceiling Fan', 'Pedestal Fan', 'Bracket Fan', 'Exhaust Fan', 'Mist Fan', 'Portable Fan'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Motor / Tech</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.motor_type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, motor_type: e.target.value }))}
                          >
                            <option value="">Select Motor</option>
                            {['Inverter BLDC Motor', 'Standard Copper Motor'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Heater & Geyser Specific Fields */}
                    {isHeaterGeyserSection && (
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Heating Type / Power Source</label>
                        <select
                          className="input text-sm cursor-pointer"
                          value={dynamicAttrs.type || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="">Select Type</option>
                          {['Gas Geyser', 'Instant Electric Geyser', 'Solar Geyser', 'Gas Heater', 'Fan Heater', 'Quartz Heater', 'Oil Radiator'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Tools Specific Fields */}
                    {isToolsSection && (
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Power Source</label>
                        <select
                          className="input text-sm cursor-pointer"
                          value={dynamicAttrs.power_source || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, power_source: e.target.value }))}
                        >
                          <option value="">Select Power Source</option>
                          {['Cordless Battery', 'Corded Electric', 'Manual', 'Pneumatic'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Generic Model/Type field if not matched above */}
                    {!isTvSection && !isAcSection && !isFridgeSection && !isWashingSection && !isOvenMicrowaveSection && !isGeneratorSection && !isUpsSection && !isSolarPanelSection && !isBatterySection && !isGamingSection && !isFanSection && !isHeaterGeyserSection && !isToolsSection && (
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type / Specifications</label>
                        <input
                          type="text"
                          className="input text-sm"
                          placeholder="e.g. Model, Capacity, Power Wattage"
                          value={dynamicAttrs.type || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

               {/* Condition Radio Button Group */}
              {!isLandPlotsCategory && !isAgriculturalLandCategory && !isCropProduceCategory && !isHousesCategory && !isApartmentsCategory && !isCommercialCategory && !isPortionsCategory && !isAnimalsCategory && !isServicesCategory && !isBusinessCategory && !isJobsCategory && (
                <div className="space-y-2">
                  <label className="label text-sm font-semibold">
                    {isFurnitureCategory || isSimplifiedCondition ? 'Condition *' : 'Device Condition *'}
                  </label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(isFurnitureCategory
                          ? [
                              { value: 'new', label: 'New' },
                              { value: 'like_new', label: 'Like New' },
                              { value: 'good', label: 'Gently Used' },
                              { value: 'fair', label: 'Used' },
                              { value: 'poor', label: 'Needs Repair' }
                            ]
                          : isBeautyCategory || isKidsBathDiapers
                          ? [
                              { value: 'new', label: 'New' }
                            ]
                          : isKidsThreeOption
                          ? [
                              { value: 'new', label: 'New' },
                              { value: 'like_new', label: 'Like New' },
                              { value: 'good', label: 'Used' }
                            ]
                          : isSimplifiedCondition
                          ? [
                              { value: 'new', label: 'New' },
                              { value: 'good', label: 'Used' }
                            ]
                          : [
                              { value: 'new', label: 'New' },
                              { value: 'good', label: 'Used' },
                              { value: 'like_new', label: 'Open Box' },
                              { value: 'fair', label: 'Refurbished' },
                              { value: 'poor', label: 'For Parts / Not Working' }
                            ]
                        ).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              "flex flex-col items-start p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01]",
                              field.value === opt.value
                                ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
                                : "border-slate-150 dark:border-slate-800 bg-surface hover:border-slate-300"
                            )}
                          >
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.condition && <p className="text-xs text-red-500 mt-0.5">{errors.condition.message}</p>}
                </div>
              )}

              {/* Car Services Product Specifications */}
              {isCarServicesSubcategory && (
                <div className="space-y-4 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Service Details</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select the type of car service offered.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Type */}
                    <div className="space-y-1">
                      <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                      <SearchableSelect
                        options={['Car Detailing', 'Car Towing', 'Car Wash', 'Denting Painting', 'Mechanic Services', 'Other']}
                        value={dynamicAttrs.type || ''}
                        onChange={(val) => setDynamicAttrs(prev => ({ ...prev, type: val }))}
                        placeholder="Select Type"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Animals Product Specifications */}
              {isAnimalsCategory && (() => {
                const subName = (subCat?.name || '').toLowerCase();
                const subSubName = (subSubCat?.name || '').toLowerCase();

                let breeds: string[] = ['Local / Desi', 'Pure Breed', 'Cross Breed', 'Imported', 'Others'];

                if (subName.includes('hen') || subSubName.includes('hen')) {
                  breeds = [
                    'Aseel Amroha', 'Aseel Bengum', 'Aseel Heera', 'Aseel Lasani', 'Aseel Mianwali',
                    'Aseel Others', 'Aseel Reza', 'Aseel Shamo', 'Aseel Sindhi', 'Aseel Thai',
                    'Australorp', 'Ayam Cemani', 'Bantam', 'Cochin', 'Frizzle', 'Golden Buff',
                    'Golden Misri', 'Leghorn', 'Lohmann', 'Minorca', 'Orpington', 'Plymouth Rock',
                    'Polish Hen', 'Rhode Island Red (RIR)', 'Sebright', 'Silkie', 'Sussex', 'Wyandotte', 'Others'
                  ];
                } else if (subName.includes('cat') || subSubName.includes('cat')) {
                  breeds = ['Persian', 'Siamese', 'British Shorthair', 'Maine Coon', 'Bengal', 'Ragdoll', 'Scottish Fold', 'Sphynx', 'Cross Breed', 'Others'];
                } else if (subName.includes('dog') || subSubName.includes('dog')) {
                  breeds = ['Labrador', 'German Shepherd', 'Golden Retriever', 'Husky', 'Pug', 'Pitbull', 'Rottweiler', 'Doberman', 'Bulldog', 'Beagle', 'Shih Tzu', 'Poodle', 'Cross Breed', 'Others'];
                } else if (subName.includes('parrot') || subSubName.includes('parrot')) {
                  breeds = ['Macaw', 'African Grey', 'Cockatoo', 'Raw / Alexandrine', 'Ringneck', 'Cockatiel', 'Lovebird', 'Sun Conure', 'Budgie / Australian', 'Others'];
                } else if (subName.includes('pigeon') || subSubName.includes('pigeon')) {
                  breeds = ['High Flyer', 'Teddy', 'Sialkoti', 'Kasuri', 'Fantailed', 'Pouter', 'Homers / Racing', 'Others'];
                } else if (subName.includes('livestock') || subName.includes('cow') || subName.includes('bull') || subName.includes('buffalo') || subName.includes('goat') || subName.includes('sheep') || subName.includes('camel') || subSubName.includes('cow') || subSubName.includes('bull') || subSubName.includes('buffalo') || subSubName.includes('goat') || subSubName.includes('sheep') || subSubName.includes('camel')) {
                  breeds = ['Sahiwal', 'Nili Ravi', 'Cholistani', 'Dhanni', 'Rajanpuri', 'Teddy', 'Beetal', 'Gulabi', 'Kamori', 'Kajla', 'Barki', 'Kachi', 'Desi / Cross', 'Others'];
                } else if (subName.includes('horse') || subSubName.includes('horse')) {
                  breeds = ['Thoroughbred', 'Arabian', 'Marwari', 'Desi', 'Nukra', 'Quarter Horse', 'Pony', 'Others'];
                }

                const categoryTitleName = subSubCat?.name || subCat?.name || mainCat?.name || 'Animals';

                return (
                  <div className="space-y-4 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Product Specifications for {categoryTitleName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select relevant details for your animal listing.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Breed */}
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Breed*</label>
                        <SearchableSelect
                          options={breeds}
                          value={dynamicAttrs.breed || ''}
                          onChange={(val) => setDynamicAttrs(prev => ({ ...prev, breed: val }))}
                          placeholder="Search breed..."
                        />
                      </div>

                      {/* Sex */}
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Sex</label>
                        <div className="flex items-center gap-2 pt-0.5">
                          {['Male', 'Female', 'Pair'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDynamicAttrs(prev => ({ ...prev, sex: opt }))}
                              className={cn(
                                "flex-1 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200",
                                dynamicAttrs.sex === opt
                                  ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-600 dark:text-primary-400 font-bold"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Age */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Age</label>
                        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
                          <input
                            type="number"
                            min="0"
                            className="w-full px-3.5 py-2.5 text-sm bg-transparent outline-none border-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                            placeholder="Enter age"
                            value={dynamicAttrs.age_num || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const unit = dynamicAttrs.age_unit || 'Months';
                              setDynamicAttrs(prev => ({ ...prev, age_num: val, age: val ? `${val} ${unit}` : '' }));
                            }}
                          />
                          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                          <select
                            className="px-3.5 py-2.5 text-sm bg-transparent outline-none border-none text-slate-700 dark:text-slate-300 cursor-pointer pr-8"
                            value={dynamicAttrs.age_unit || 'Months'}
                            onChange={(e) => {
                              const unit = e.target.value;
                              const val = dynamicAttrs.age_num || '';
                              setDynamicAttrs(prev => ({ ...prev, age_unit: unit, age: val ? `${val} ${unit}` : '' }));
                            }}
                          >
                            <option value="Months">Months</option>
                            <option value="Years">Years</option>
                            <option value="Weeks">Weeks</option>
                            <option value="Days">Days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Food & Restaurants Sub-subcategory Type Dropdowns */}
              {(() => {
                const subSubId = subSubCat?.id || '';
                const subSubName = (subSubCat?.name || '').toLowerCase();
                const subSubSlug = (subSubCat?.slug || '').toLowerCase();

                const isBakingEquipments = subSubId === 'd1000000-0000-0000-0000-000000000f30' || subSubSlug === 'baking-equipments' || subSubName.includes('baking equipment');
                const isFoodDisplayCounters = subSubId === 'd1000000-0000-0000-0000-000000000f31' || subSubSlug === 'food-display-counters' || subSubName.includes('food display counter');
                const isOvensTandoor = subSubId === 'd1000000-0000-0000-0000-000000000f32' || subSubSlug === 'ovens-tandoor' || subSubName.includes('ovens & tandoor') || subSubName.includes('oven');

                if (!isBakingEquipments && !isFoodDisplayCounters && !isOvensTandoor) return null;

                let typeOptions: string[] = [];
                if (isBakingEquipments) {
                  typeOptions = ['Dough Mixer', 'Waffle Makers', 'Breading Tables', 'Bakery Counters', 'Others'];
                } else if (isFoodDisplayCounters) {
                  typeOptions = ['Fries', 'Shawarma', 'Biryani', 'Bakery', 'Fast Food', 'Others'];
                } else if (isOvensTandoor) {
                  typeOptions = ['Baking Oven', 'Pizza Oven', 'Tandoor', 'Others'];
                }

                return (
                  <div className="space-y-4 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Equipment Type</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select the type of equipment for your listing.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                        <select
                          className="input text-sm cursor-pointer"
                          value={dynamicAttrs.type || ''}
                          onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="">Select Type</option>
                          {typeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Construction & Heavy Machinery Sub-subcategory Dropdowns */}
              {(() => {
                const subSubId = subSubCat?.id || '';
                const subSubName = (subSubCat?.name || '').toLowerCase();
                const subSubSlug = (subSubCat?.slug || '').toLowerCase();

                const isConstructionMaterial = subSubId === 'd1000000-0000-0000-0000-000000000f50' || subSubSlug === 'construction-material' || subSubName.includes('construction material');
                const isDrillMachines = subSubId === 'd1000000-0000-0000-0000-000000000f52' || subSubSlug === 'drill-machines' || subSubName.includes('drill machine');

                if (!isConstructionMaterial && !isDrillMachines) return null;

                const materialTypes = ['Bricks', 'Crush', 'Cement', 'Sand', 'Steel', 'Pipes', 'Paints', 'Marbles & Granites', 'Tiles', 'Others'];
                const drillBrands = ['Boda', 'Bosch', 'Crown', 'DCK', 'Dong Cheng', 'Emtop', 'Harden', 'Hyundai', 'Ingco', 'Jadever', 'Makita', 'Prescott', 'Semprox', 'Total Tools', 'Wadfow', 'Others'];

                return (
                  <div className="space-y-4 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {isConstructionMaterial ? "Construction Material Specifications" : "Drill Machine Specifications"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fill in details to help buyers find your listing faster.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isConstructionMaterial && (
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Type *</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.type || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="">Select Type</option>
                            {materialTypes.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isDrillMachines && (
                        <div className="space-y-1">
                          <label className="label text-xs font-bold text-slate-700 dark:text-slate-300">Brand *</label>
                          <select
                            className="input text-sm cursor-pointer"
                            value={dynamicAttrs.brand || ''}
                            onChange={(e) => setDynamicAttrs(prev => ({ ...prev, brand: e.target.value }))}
                          >
                            <option value="">Select Brand</option>
                            {drillBrands.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* AI Title Assist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label">Ad Title *</label>
                  <button
                    type="button"
                    onClick={handleSuggestTitles}
                    disabled={suggestingTitles}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    {suggestingTitles ? 'Analyzing...' : 'Suggest Titles'}
                  </button>
                </div>
                <Input
                  placeholder="e.g. iPhone 14 Pro Max 256GB Space Gray"
                  error={errors.title?.message}
                  {...register('title', {
                    onChange: () => {
                      userEditedTitleRef.current = true;
                    }
                  })}
                />
                {aiTitles.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-3 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl space-y-2">
                    <p className="text-xs text-primary-700 font-bold">Suggested Titles (Click to set):</p>
                    <div className="flex flex-col gap-1.5">
                      {aiTitles.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setValue('title', t); setAiTitles([]); }}
                          className="text-xs text-left text-slate-700 dark:text-slate-300 hover:text-primary-600 hover:underline"
                        >
                          ⭐ {t}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* AI Description Assist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="label">Item Description *</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={generatingDesc}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    {generatingDesc ? 'Generating...' : 'Auto-Write with AI'}
                  </button>
                </div>
                <Textarea
                  placeholder="Describe your item in detail. Include condition details, package contents, reason for sale, etc."
                  rows={8}
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Media Uploads (Drag & Drop + Reorder) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Image upload */}
            <div className="card p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Photos & Video</h2>
                <p className="text-xs text-slate-500 mt-1">Upload up to 10 photos. Reorder them using arrows. The first photo is your listing cover.</p>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  const validFiles: File[] = [];
                  const validPreviews: string[] = [];
                  files.forEach(file => {
                    const error = validateImageFile(file);
                    if (error) { toast.error(error); return; }
                    if (images.length + validFiles.length >= 10) { toast.error('Maximum 10 images allowed'); return; }
                    validFiles.push(file);
                    validPreviews.push(URL.createObjectURL(file));
                  });
                  setImageFiles(prev => [...prev, ...validFiles]);
                  setImages(prev => [...prev, ...validPreviews]);
                }}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-400 p-8 rounded-2xl text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/10 transition-colors"
              >
                <label className="cursor-pointer block">
                  <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 block">Drag & Drop Photos Here</span>
                  <span className="text-xs text-slate-400 block mt-1">or click to browse local files (JPEG, PNG, WebP)</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border group ${idx === 0 ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                    >
                      <img src={img} alt={`ad-image-${idx}`} className="w-full h-full object-cover" />

                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">Cover</span>
                      )}

                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2.5 transition-opacity">
                        <div className="flex justify-between items-start">
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="w-7 h-7 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Delete Photo"
                          >
                            <X size={14} />
                          </button>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => setAsCover(idx)}
                              className="bg-primary-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              Set Cover
                            </button>
                          )}
                        </div>

                        <div className="flex gap-2 justify-center">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'left')}
                              className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-xl flex items-center justify-center transition-colors"
                              title="Move Left"
                            >
                              <ChevronLeft size={16} />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, 'right')}
                              className="w-7 h-7 bg-white/20 hover:bg-white/40 text-white rounded-xl flex items-center justify-center transition-colors"
                              title="Move Right"
                            >
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video upload */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Product Video (Optional)</h3>
              {video ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <video src={video} controls className="w-full h-full" />
                  <button
                    type="button"
                    onClick={() => { setVideo(null); setVideoFile(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-primary-400 bg-slate-50/50 dark:bg-slate-800/10 transition-colors">
                  <Video size={32} className="text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Click to upload product tour video</span>
                  <span className="text-xs text-slate-400 mt-1">Maximum size 50MB (MP4, WebM)</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Price & Location (Interactive Map Picker) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card p-6 space-y-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
                {!isPriceEnabled ? 'Location' : 'Pricing & Location'}
              </h2>

              {/* Price input */}
              {isPriceEnabled && (
                <div>
                  <label className="label">{isPropertyForRentCategory ? 'Monthly Rent (PKR) *' : 'Price (PKR) *'}</label>
                  <div className="relative">
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className={`input pr-16 ${errors.price ? 'border-red-400' : ''}`}
                          {...field}
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">PKR</div>
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}

                  {/* AI Price suggestion indicator */}
                  {aiPriceSuggestion && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          AI Valuation: PKR {aiPriceSuggestion.min.toLocaleString()} - {aiPriceSuggestion.max.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue('price', aiPriceSuggestion.suggested)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
                      >
                        Apply Suggested (PKR {aiPriceSuggestion.suggested.toLocaleString()})
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {isPriceEnabled && (
                <div className="flex items-center gap-2.5 py-1">
                  <input
                    type="checkbox"
                    id="negotiable"
                    className="w-4.5 h-4.5 accent-primary-600 rounded"
                    {...register('is_negotiable')}
                  />
                  <label htmlFor="negotiable" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    This price is negotiable
                  </label>
                </div>
              )}

              {/* Location Picker */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2 relative">
                  <label className="label text-sm font-semibold">Location *</label>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="e.g. Islamabad, DHA Phase 5 or Lahore, Gulberg"
                        {...register('city', {
                          onChange: () => {
                            setShowCitySuggestions(true);
                          }
                        })}
                        onFocus={() => setShowCitySuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                        className="input text-sm pr-24 w-full"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={handleUnifiedLocate}
                        disabled={fetchingGeo}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1.5 rounded-xl border border-primary-100 dark:border-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all duration-200"
                      >
                        {fetchingGeo ? (
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary-600 dark:border-primary-400 border-t-transparent" />
                        ) : (
                          <MapPin size={12} className="text-primary-500" />
                        )}
                        <span>Locate</span>
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              const currentVal = watch('city') || '';
                              const parts = currentVal.split(',');
                              const areaPart = parts.slice(1).join(',');
                              const newValue = areaPart.trim() ? `${city}, ${areaPart.trim()}` : city;
                              setValue('city', newValue);
                              setShowCitySuggestions(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
                          >
                            <span>📍</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{city}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Pakistan</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.075-1.748-.372-1.378-.553-2.28-1.93-2.35-2.022-.069-.092-.56-.745-.56-1.42 0-.676.353-1.009.479-1.147.126-.138.273-.173.364-.173.091 0 .182.001.261.005.083.004.195-.031.305.234.115.277.391.954.425 1.023.034.069.057.15.011.241-.045.092-.068.149-.137.23-.069.08-.145.179-.207.24-.069.069-.141.144-.06.284.08.139.359.593.771.96.531.474.978.621 1.117.69.138.069.219.058.3-.035.08-.092.345-.402.437-.54.092-.138.184-.115.31-.069.127.046.805.38.943.449.138.069.23.103.264.161.034.057.034.333-.11.738z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.344 21.656a1 1 0 001.218 1.218l4.488-1.094A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.288-1.243l-.307-.184-2.585.63.642-2.528-.198-.322A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Contact Information</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Buyers will connect with you directly through WhatsApp</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Editable Name Field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name *</label>
                  <div className="w-full sm:max-w-md">
                    <Input
                      placeholder="Enter your name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Add WhatsApp Number Field */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add WhatsApp Number *</label>
                    <p className="text-[11px] text-slate-500 mt-0.5">Enter your active WhatsApp number for direct buyer chats</p>
                  </div>
                  <div className="w-full sm:max-w-md relative">
                    <Input
                      placeholder="e.g. 0300 1234567 or +92 300 1234567"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Live Preview & Spam Check */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Spam analysis warning */}
            {analyzingSpam ? (
              <div className="card p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 flex items-center gap-3">
                <RefreshCw className="animate-spin text-primary-500 shrink-0" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Running AI policy scanner & spam detection...</span>
              </div>
            ) : spamAnalysis?.isSpam ? (
              <div className="card p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-start gap-3">
                <ShieldAlert className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400">Policy Violation Detected</h4>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{spamAnalysis.reason || 'This listing looks suspicious or duplicates standard spam templates.'}</p>
                </div>
              </div>
            ) : (
              <div className="card p-5 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 flex items-center gap-3">
                <CheckCircle2 className="text-green-500 shrink-0" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">Listing passed spam check successfully. Ready to post!</span>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Eye size={18} className="text-primary-500" /> Live Listing Preview
              </h3>

              <div className="max-w-md mx-auto bg-surface border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg transition-transform hover:scale-[1.01]">
                {/* Image cover carousel simulation */}
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                  {images.length > 0 ? (
                    <img src={images[0]} alt="listing-cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Cover Image</div>
                  )}
                  <span className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">1/{images.length || 1}</span>
                  <span className="absolute bottom-3 left-3 bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg capitalize">
                    {mainCat?.name}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      {isPriceEnabled && (
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                          PKR {watchPrice?.toLocaleString() || 0}
                          {isPropertyForRentCategory && <span className="text-sm font-semibold text-slate-500"> / month</span>}
                        </span>
                      )}
                      {isPriceEnabled && watch('is_negotiable') && (
                        <span className="text-[10px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Negotiable</span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 line-clamp-1">
                      {watchTitle || 'Listing Title'}
                    </h4>
                  </div>

                  {/* Attributes preview tags */}
                  {Object.keys(dynamicAttrs).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                      {Object.entries(dynamicAttrs).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg font-medium">
                          <strong>{k.replace(/_/g, ' ')}</strong>: {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <MapPin size={12} />
                    <span>{watch('city') || 'Location'} {watch('location') && `, ${watch('location')}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Preview */}
            <div className="card p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 space-y-3 max-w-md mx-auto">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">WhatsApp Contact Details</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Contact Name:</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{contactName}</p>
                </div>
                <div>
                  <span className="text-slate-400">WhatsApp Number:</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {whatsappNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting || uploading}
          icon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={nextStep}
            iconRight={<ChevronRight size={16} />}
          >
            Next Step
          </Button>
        ) : (
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting || uploading}
            disabled={spamAnalysis?.isSpam || analyzingSpam}
            icon={<Plus size={16} />}
          >
            {listing ? 'Update Listing' : 'Publish Listing'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingForm;