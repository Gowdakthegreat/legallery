"use client";

import { useState } from "react";
import { EtherInput } from "@scaffold-ui/components";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";
import { eth } from "~~/utils/registro";
import { notification } from "~~/utils/scaffold-eth";
import type { AllowedChainIds } from "~~/utils/scaffold-eth";

/**
 * Anúncio de venda. Antes de anunciar, o registro precisa autorizar o marketplace a movimentar
 * a obra — é a única via por onde ela pode circular.
 */
export const AnunciarObra = ({ tokenId }: { tokenId: bigint }) => {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [preco, setPreco] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const { data: marketplaceInfo } = useDeployedContractInfo({
    contractName: "ArtMarketplace",
    chainId: targetNetwork.id as AllowedChainIds,
  });

  const { data: autorizado, refetch: recarregarAutorizacao } = useScaffoldReadContract({
    contractName: "ArtRegistry",
    functionName: "isApprovedForAll",
    args: [address, marketplaceInfo?.address],
  });

  const precoWei = (() => {
    try {
      return preco ? parseEther(preco) : 0n;
    } catch {
      return 0n;
    }
  })();

  const { data: simulacao } = useScaffoldReadContract({
    contractName: "ArtMarketplace",
    functionName: "previewSettlement",
    args: [tokenId, address, precoWei],
  });

  const { writeContractAsync: escreverRegistro } = useScaffoldWriteContract({ contractName: "ArtRegistry" });
  const { writeContractAsync: escreverMercado } = useScaffoldWriteContract({ contractName: "ArtMarketplace" });

  const autorizar = async () => {
    if (!marketplaceInfo?.address) return;
    setOcupado(true);
    try {
      await escreverRegistro({ functionName: "setApprovalForAll", args: [marketplaceInfo.address, true] });
      await recarregarAutorizacao();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to approve the marketplace.");
    } finally {
      setOcupado(false);
    }
  };

  const anunciar = async () => {
    if (precoWei <= 0n) return;
    setOcupado(true);
    try {
      await escreverMercado({ functionName: "listWork", args: [tokenId, precoWei] });
      notification.success("Work listed.");
      setPreco("");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to list the work.");
    } finally {
      setOcupado(false);
    }
  };

  const royalty = simulacao?.[0] ?? 0n;
  const paraVendedor = simulacao?.[1] ?? 0n;

  return (
    <div className="flex flex-col gap-2">
      {!autorizado ? (
        <button className="btn btn-sm btn-outline" disabled={ocupado} onClick={autorizar}>
          {ocupado ? <span className="loading loading-spinner loading-xs" /> : null}
          Approve the marketplace
        </button>
      ) : (
        <>
          <EtherInput placeholder="Price" onValueChange={({ valueInEth }) => setPreco(valueInEth)} />
          {precoWei > 0n && (
            <p className="text-xs text-base-content/70">
              {royalty > 0n ? (
                <>
                  Resale royalty to the author: <strong>{eth(royalty)}</strong> · you receive{" "}
                  <strong>{eth(paraVendedor)}</strong>
                </>
              ) : (
                <>No resale royalty on this sale · you receive {eth(paraVendedor)}</>
              )}
            </p>
          )}
          <button className="btn btn-sm btn-primary" disabled={ocupado || precoWei <= 0n} onClick={anunciar}>
            {ocupado ? <span className="loading loading-spinner loading-xs" /> : null}
            List for sale
          </button>
        </>
      )}
    </div>
  );
};
