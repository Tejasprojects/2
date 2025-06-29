
import React, { useState, useEffect } from 'react';
import { useBlockchain } from '@/context/BlockchainContext';
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink, LogOut, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasWeb3Support } from '@/utils/qwixMaskWallet';
import { useToast } from '@/components/ui/use-toast';

export const WalletConnect: React.FC = () => {
  const { isConnected, account, balance, chainId, connectWallet, disconnectWallet } = useBlockchain();
  const { toast } = useToast();
  const [isWeb3Supported, setIsWeb3Supported] = useState(true);

  // Check if Web3 is supported
  useEffect(() => {
    setIsWeb3Supported(hasWeb3Support());
  }, []);

  const truncateAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNetworkName = (id: number | null): string => {
    if (!id) return 'QwixChain Network';
    
    switch (id) {
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Goerli Testnet';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      default:
        return `QwixChain (${id})`;
    }
  };

  const viewOnExplorer = () => {
    if (!account || !chainId) return;
    
    let explorerUrl = '';
    
    switch (chainId) {
      case 1:
        explorerUrl = `https://etherscan.io/address/${account}`;
        break;
      case 5:
        explorerUrl = `https://goerli.etherscan.io/address/${account}`;
        break;
      case 137:
        explorerUrl = `https://polygonscan.com/address/${account}`;
        break;
      case 80001:
        explorerUrl = `https://mumbai.polygonscan.com/address/${account}`;
        break;
      default:
        explorerUrl = `https://qwixscan.com/address/${account}`;
        break;
    }
    
    window.open(explorerUrl, '_blank');
  };

  const handleConnectWallet = async () => {
    if (!isWeb3Supported) {
      toast({
        title: "Web3 not supported",
        description: "Please install a Web3 wallet like MetaMask or QwixMask.",
        variant: "destructive"
      });
      return;
    }

    try {
      await connectWallet();
      toast({
        title: "Wallet connected",
        description: "Your wallet has been successfully connected.",
      });
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isConnected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
            <span>{truncateAddress(account)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Web3 Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium mb-1">Account:</p>
            <p className="text-xs text-muted-foreground font-mono">{account}</p>
          </div>
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium mb-1">Balance:</p>
            <p className="text-xs text-muted-foreground">{balance} ETH</p>
          </div>
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium mb-1">Network:</p>
            <p className="text-xs text-muted-foreground">{getNetworkName(chainId)}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on Explorer</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!isWeb3Supported) {
    return (
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <AlertTriangle className="h-4 w-4" />
        <span>Web3 Not Supported</span>
      </Button>
    );
  }

  return (
    <Button onClick={handleConnectWallet} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  );
};

export default WalletConnect;
