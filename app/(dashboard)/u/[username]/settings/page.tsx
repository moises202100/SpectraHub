"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateStream } from "@/actions/stream";
import { useUser } from "@clerk/nextjs";
import {
  Crown, 
  MessageSquare, 
  Video,
  ChevronDown,
  Menu,
  DollarSign,
  Coins,
  EyeOff
} from "lucide-react";
import { RedemptionModal } from "../_components/redemption-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TipMenuItem {
  id: string;
  name: string;
  description?: string;
  tokens: number;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface NewTipItem {
  name: string;
  description: string;
  tokens: string;
}

const COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MK", name: "North Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }

];

const SettingsPage = () => {
  const { user } = useUser();
  const [showTopic, setShowTopic] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [showTipMenu, setShowTipMenu] = useState(false);
  const [showKingSettings, setShowKingSettings] = useState(false);
  const [showCollectMoney, setShowCollectMoney] = useState(false);
  const [showHideProfile, setShowHideProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState("");
  const [kingTokens, setKingTokens] = useState("1000");
  const [tipMenuItems, setTipMenuItems] = useState<TipMenuItem[]>([]);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);
  const [newTipItem, setNewTipItem] = useState<NewTipItem>({
    name: "",
    description: "",
    tokens: ""
  });

  useEffect(() => {
    const loadStreamData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/stream/${user.id}`);
        if (!response.ok) throw new Error("Failed to load stream data");
        const data = await response.json();
        setPinnedMessage(data.pinnedMessage || "");
        setKingTokens(data.kingTokens?.toString() || "1000");
        setBlockedCountries(data.blockedCountries || []);
      } catch (error) {
        console.error("Failed to load stream data:", error);
      }
    };

    loadStreamData();
  }, [user?.id]);

  useEffect(() => {
    const loadTipMenu = async () => {
      if (!user?.username) return;
      
      try {
        const response = await fetch(`/api/tip-menu?username=${user.username}`);
        if (!response.ok) throw new Error("Failed to load tip menu");
        const data = await response.json();
        setTipMenuItems(data);
      } catch (error) {
        console.error("Failed to load tip menu:", error);
      }
    };

    loadTipMenu();
  }, [user?.username]);

  const handleSaveTopic = async () => {
    try {
      setIsLoading(true);
      await updateStream({ 
        pinnedMessage: pinnedMessage.trim() 
      });
      toast.success("Stream topic updated!");
      setShowTopic(false);
    } catch (error) {
      console.error("Error updating stream:", error);
      toast.error("Failed to update stream topic");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKingTokens = async () => {
    try {
      setIsLoading(true);
      await updateStream({ 
        kingTokens: parseInt(kingTokens) 
      });
      toast.success("King of Room settings updated!");
      setShowKingSettings(false);
    } catch (error) {
      console.error("Error updating king tokens:", error);
      toast.error("Failed to update King of Room settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTipMenuItem = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tip-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newTipItem.name,
          description: newTipItem.description,
          tokens: parseInt(newTipItem.tokens)
        })
      });

      if (!response.ok) throw new Error("Failed to add tip menu item");

      const newItem = await response.json();
      setTipMenuItems([...tipMenuItems, newItem]);
      setNewTipItem({ name: "", description: "", tokens: "" });
      toast.success("Tip menu item added!");
    } catch (error) {
      toast.error("Failed to add tip menu item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTipMenuItem = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tip-menu?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to delete tip menu item");

      setTipMenuItems(tipMenuItems.filter((item) => item.id !== id));
      toast.success("Tip menu item deleted!");
    } catch (error) {
      toast.error("Failed to delete tip menu item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBlockedCountries = async (countries: string[]) => {
    try {
      setIsLoading(true);
      await updateStream({ 
        blockedCountries: countries 
      });
      setBlockedCountries(countries);
      toast.success("Profile visibility settings updated!");
    } catch (error) {
      console.error("Error updating blocked countries:", error);
      toast.error("Failed to update profile visibility settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Stream Topic Section */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowTopic(!showTopic)}
        >
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Stream Topic</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showTopic ? 'rotate-180' : ''}`} />
        </div>
        
        {showTopic && (
          <div className="p-4 border-t">
            <div className="space-y-4">
              <Input 
                placeholder="Tell viewers what you're doing today..."
                className="bg-muted"
                value={pinnedMessage}
                onChange={(e) => setPinnedMessage(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This message will be pinned at the top of your chat. Share what's happening in your stream!
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowTopic(false);
                    setPinnedMessage(pinnedMessage);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleSaveTopic}
                  disabled={isLoading || !pinnedMessage.trim()}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* King of Room Settings */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowKingSettings(!showKingSettings)}
        >
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">King of Room Settings</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showKingSettings ? 'rotate-180' : ''}`} />
        </div>
        
        {showKingSettings && (
          <div className="p-4 border-t space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Minimum Tokens Required to Become King
              </label>
              <Input 
                type="number"
                min="100"
                value={kingTokens}
                onChange={(e) => setKingTokens(e.target.value)}
                placeholder="Enter minimum tokens (e.g., 1000)"
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Users must tip this amount or more to become the King of the Room.
                The crown will appear next to their chat messages.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost"
                onClick={() => setShowKingSettings(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveKingTokens}
                disabled={isLoading || !kingTokens || parseInt(kingTokens) < 100}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collect Money Section */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowCollectMoney(!showCollectMoney)}
        >
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">Collect Money</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showCollectMoney ? 'rotate-180' : ''}`} />
        </div>
        
        {showCollectMoney && (
          <div className="p-4 border-t space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Convert your earned tokens to real money through PayPal.
                Rate: 100 tokens = $8 USD
              </p>
              <Button
                onClick={() => setShowRedemptionModal(true)}
                variant="primary"
                className="w-full"
              >
                Redeem Tokens
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hide Profile Section */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowHideProfile(!showHideProfile)}
        >
          <div className="flex items-center gap-3">
            <EyeOff className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Hide Profile</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showHideProfile ? 'rotate-180' : ''}`} />
        </div>
        
        {showHideProfile && (
          <div className="p-4 border-t space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Countries to Hide Profile</label>
              <Select
                value={blockedCountries.join(",")}
                onValueChange={(value) => handleUpdateBlockedCountries(value ? value.split(",") : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select countries" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem 
                      key={country.code} 
                      value={country.code}
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Your profile will be hidden from users in the selected countries.
              </p>
              {blockedCountries.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Currently Hidden In:</h3>
                  <div className="flex flex-wrap gap-2">
                    {blockedCountries.map((code) => (
                      <div 
                        key={code}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {COUNTRIES.find(c => c.code === code)?.name}
                        <button
                          onClick={() => handleUpdateBlockedCountries(
                            blockedCountries.filter(c => c !== code)
                          )}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tip Menu Section */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowTipMenu(!showTipMenu)}
        >
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Tip Menu</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showTipMenu ? 'rotate-180' : ''}`} />
        </div>
        
        {showTipMenu && (
          <div className="p-4 border-t space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newTipItem.name}
                    onChange={(e) => setNewTipItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Special Request"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={newTipItem.description}
                    onChange={(e) => setNewTipItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what viewers get for this tip"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tokens</label>
                  <Input
                    type="number"
                    value={newTipItem.tokens}
                    onChange={(e) => setNewTipItem(prev => ({ ...prev, tokens: e.target.value }))}
                    placeholder="Amount of tokens"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddTipMenuItem}
                disabled={isLoading || !newTipItem.name || !newTipItem.tokens}
                className="w-full"
              >
                Add Menu Item
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Current Menu Items</h3>
              {tipMenuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="text-sm">{item.tokens} tokens</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTipMenuItem(item.id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recording Settings */}
      <div className="bg-background border rounded-lg">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setShowRecording(!showRecording)}
        >
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Recording Settings</h2>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${showRecording ? 'rotate-180' : ''}`} />
        </div>
        
        {showRecording && (
          <div className="p-4 border-t space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Public Stream Recording</p>
                <p className="text-sm text-muted-foreground">
                  Set the price for users to record your public streams
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="number"
                placeholder="0"
                className="max-w-[100px]"
              />
              <span className="text-muted-foreground">tokens/min</span>
            </div>
          </div>
        )}
      </div>

      <RedemptionModal 
        isOpen={showRedemptionModal}
        onClose={() => setShowRedemptionModal(false)}
      />
    </div>
  );
};

export default SettingsPage;